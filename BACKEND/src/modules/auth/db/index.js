import AuthModel from "../../../models/AuthModel.js";

const getAll = async () => await AuthModel.find();

const addData = (data) =>
    AuthModel(data).save().then((user) => user.toObject());

const deleteById = async (id) => await AuthModel.findByIdAndDelete(id);

const updateById = async (id, data) => await AuthModel.findByIdAndUpdate(id, data);
const findByEmail = async (email) => await AuthModel.findOne({ email });


export {
    getAll,
    addData,
    deleteById,
    updateById,
    findByEmail
}