import { INTERNAL_SERVER_ERROR_MESSAGE, USER_DELETED_SUCCESSFULLY } from "../../../constants/index.js";
import deleteData from "../services/delete.js";

const deleteController = async (req, res) => {
    try {
        const { id } = req.params;
        await deleteData(id)
        res.status(200).send({ status: 200, message: USER_DELETED_SUCCESSFULLY });


    } catch (err) {
        res.status(500).send({ status: 500, message: INTERNAL_SERVER_ERROR_MESSAGE });
    }
}

export default deleteController;