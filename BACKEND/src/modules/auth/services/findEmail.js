import { findByEmail } from "../db/index.js";

const findEmail = async (email) => {
    console.log(email);
    
    return await findByEmail(email);
}

export default findEmail;