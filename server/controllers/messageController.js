import { AppDataSource } from '../database.js';

export async function createMessage(message) {
    try {
        const messageRepo = AppDataSource.getRepository('Message');
        const newMessage = messageRepo.create({
            type: message.type,
            content: message.content,
            senderId: message.senderId,
            receiverId: message.receiverId
        });
        
        await messageRepo.save(newMessage);
        
        const messageWithRelations = await messageRepo.findOne({
            where: { id: newMessage.id },
            relations: { sender: true, receiver: true }
        });

        return messageWithRelations;
    }
    catch (error) {
        console.log(error)
        return null;
    }
}

/*


export async function createMessage(req, res) {
    try {
        const {senderId, receiverId, content, subject} = req.body;

        const newMessage = await prisma.message.create({
            data: {
                subject: subject,
                content: content,
                sender: {
                    connect: {
                        id: senderId,
                    }
                },
                receiver: {
                    connect: {
                        id: receiverId,
                    }
                }
            },
        });

        res.status(200).json({data: newMessage });
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ message: "Error creating message" });
    }
}
 */


export async function getMessages(req, res) {
    try {
        const messageRepo = AppDataSource.getRepository('Message');
        const messages = await messageRepo.createQueryBuilder('message')
            .leftJoinAndSelect('message.sender', 'sender')
            .leftJoinAndSelect('message.receiver', 'receiver')
            .where('message.senderId = :userId', { userId: req.user.userId })
            .orWhere('message.receiverId = :userId', { userId: req.user.userId })
            .getMany();

        res.status(200).json({data: messages });

    }
    catch (error) {
        res.status(500).json({ message: "Error getting messages" });
    }
}