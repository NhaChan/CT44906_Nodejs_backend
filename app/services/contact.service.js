const { ObjectId } = require("mongodb");

//cai dat handler findAll 5/10
// exports.findAll = async (req, res, next) => {
//     let document = [];

//     try {
//         const contactService = new ContactService(MongoDB.client);
//         const { name } = req.query
//         if(name) {
//             document = await contactService.findByName(name);
//         } else {
//             document = await contactService.find({});
//         }
//     } catch (error) {
//         return next(
//             new MongoAPIError(500, "An error occurred while retrieving contatcs")
//         );
//     }
//     return res.send(documents);
// }

class ContactService {
    constructor(client) {
        this.Contact = client.db().collection("contacts");
    }

    extractConactData(payload) {
        const contact = {
            name: payload.name,
            email: payload.email,
            address: payload.address,
            phone: payload.phone,
            favorite: payload.favorite,
        };
        // Remove undefined fields
        Object.keys(contact).forEach(
            (key) => contact[key] === undefined && delete contact[key]
        );
        return contact;
    }
    async create(payload) {
        const contact = this.extractConactData(payload);
        const result = await this.Contact.findOneAndUpdate(
            { email: contact.email },
            { $set: { ...contact } },
            { returnDocument: "after", upsert: true }
        );
        return result.value;
    }

    async find(filter) {
        const cursor = await this.Contact.find(filter);
        return await cursor.toArray();
    }

    async findByName(name) {
        return await this.find({
            name: { $regex: new RegExp(name), $options: "i" },
        });
    }

    async findById(id) {
        return await this.Contact.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }
    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const update = this.extractConactData(payload);
        const result = await this.Contact.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument: "after" }
        );
        return result.value;
    }

    async delete(id) {
        const result = await this.Contact.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result.value;
    }

    async findFavorite() {
        return
        await this.find({ favorite: true });
    }

    async deleteAll() {
        const result = await this.Contact.deleteMany({});
        return result.deletedCount;
    }
}

module.exports = ContactService;