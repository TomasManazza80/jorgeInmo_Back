import { AppDataSource } from '../database.js';

export const logEvent = async (req, res) => {
    try {
        const { visitorId, propertyId, eventType, userId } = req.body;
        
        if (!visitorId || !propertyId || !eventType) {
            return res.status(400).json({ status: 'error', message: 'Faltan parámetros requeridos.' });
        }
        
        const visitorRepo = AppDataSource.getRepository('Visitor');
        const activityRepo = AppDataSource.getRepository('PropertyActivity');
        
        let visitor = await visitorRepo.findOne({ where: { id: visitorId } });
        if (!visitor) {
            visitor = visitorRepo.create({ id: visitorId, userId: userId || null });
            await visitorRepo.save(visitor);
        } else if (userId && !visitor.userId) {
            visitor.userId = userId;
            await visitorRepo.save(visitor);
        }
        
        // Puntuación
        let score = 0;
        switch (eventType) {
            case 'VIEW_PROPERTY':
                const previousViews = await activityRepo.count({ where: { visitorId, realEstateObjectId: propertyId, eventType: 'VIEW_PROPERTY' } });
                score = previousViews === 0 ? 1 : 3; // +1 primera vez, +3 visitas extra
                break;
            case 'TIME_ON_PAGE_1MIN':
                const previous1Min = await activityRepo.findOne({ where: { visitorId, realEstateObjectId: propertyId, eventType: 'TIME_ON_PAGE_1MIN' } });
                if (!previous1Min) score = 2; // +2 solo la primera vez por propiedad
                break;
            case 'TIME_ON_PAGE_3MIN':
                const previous3Min = await activityRepo.findOne({ where: { visitorId, realEstateObjectId: propertyId, eventType: 'TIME_ON_PAGE_3MIN' } });
                if (!previous3Min) score = 5; // +5 solo la primera vez por propiedad
                break;
            case 'VIEW_PHOTOS':
            case 'VIEW_MAP':
                score = 2; // +2 puntos
                break;
            default:
                score = 0;
        }
        
        if (score > 0) {
            const activity = activityRepo.create({
                visitorId,
                realEstateObjectId: propertyId,
                eventType,
                scoreAwarded: score
            });
            await activityRepo.save(activity);
            
            visitor.totalScore += score;
            await visitorRepo.save(visitor);
        }
        
        res.status(200).json({ status: 'success', currentScore: visitor.totalScore, scoreAwarded: score });
    } catch (error) {
        console.error('Error logging event:', error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor.' });
    }
};

export const getLeads = async (req, res) => {
    try {
        const userRepo = AppDataSource.getRepository('User');
        const visitorRepo = AppDataSource.getRepository('Visitor');
        
        const users = await userRepo.find();
        const visitors = await visitorRepo.find({
            relations: ['activities', 'activities.realEstateObject'],
        });

        const visitorByUserId = {};
        const anonymousVisitors = [];

        visitors.forEach(v => {
            if (v.userId) {
                visitorByUserId[v.userId] = v;
            } else if (v.email || v.phone || v.name) {
                anonymousVisitors.push(v);
            }
        });

        let leads = [];

        users.forEach(user => {
            const v = visitorByUserId[user.id];
            let topProperty = null;
            let activityCount = 0;
            let totalScore = 0;

            if (v) {
                totalScore = v.totalScore;
                activityCount = v.activities.length;
                
                const propertyCounts = {};
                let maxScore = 0;
                
                v.activities.forEach(act => {
                    if (!propertyCounts[act.realEstateObjectId]) {
                        propertyCounts[act.realEstateObjectId] = {
                            property: act.realEstateObject,
                            score: 0
                        };
                    }
                    propertyCounts[act.realEstateObjectId].score += act.scoreAwarded;
                });
                
                for (const propId in propertyCounts) {
                    if (propertyCounts[propId].score > maxScore) {
                        maxScore = propertyCounts[propId].score;
                        topProperty = propertyCounts[propId].property;
                    }
                }
            }

            let interestStatus = 'Poco interesado';
            if (totalScore >= 10) interestStatus = 'Interesado';
            else if (totalScore > 0) interestStatus = 'Medianamente interesado';

            leads.push({
                id: `user-${user.id}`,
                name: user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email || `Usuario #${user.id}`,
                email: user.email,
                phone: user.phone,
                totalScore,
                interestStatus,
                topProperty: topProperty ? { id: topProperty.id, title: topProperty.title } : null,
                activityCount,
                createdAt: user.createdAt,
                isRegistered: true
            });
        });

        anonymousVisitors.forEach(v => {
            let topProperty = null;
            let maxScore = 0;
            const propertyCounts = {};
            
            v.activities.forEach(act => {
                if (!propertyCounts[act.realEstateObjectId]) {
                    propertyCounts[act.realEstateObjectId] = {
                        property: act.realEstateObject,
                        score: 0
                    };
                }
                propertyCounts[act.realEstateObjectId].score += act.scoreAwarded;
            });
            
            for (const propId in propertyCounts) {
                if (propertyCounts[propId].score > maxScore) {
                    maxScore = propertyCounts[propId].score;
                    topProperty = propertyCounts[propId].property;
                }
            }

            let interestStatus = 'Poco interesado';
            if (v.totalScore >= 10) interestStatus = 'Interesado';
            else if (v.totalScore > 0) interestStatus = 'Medianamente interesado';

            leads.push({
                id: `visitor-${v.id}`,
                name: v.name || 'Visitante Anónimo',
                email: v.email,
                phone: v.phone,
                totalScore: v.totalScore,
                interestStatus,
                topProperty: topProperty ? { id: topProperty.id, title: topProperty.title } : null,
                activityCount: v.activities.length,
                createdAt: v.createdAt,
                isRegistered: false
            });
        });

        leads.sort((a, b) => b.totalScore - a.totalScore);
        
        res.status(200).json({ status: 'success', data: leads });
    } catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor.' });
    }
};
