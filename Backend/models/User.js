import mongoose from 'mongoose';
import bcrypt from 'bcrypt';  

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
},
{
    timestamps:true
});

// Correct usage: Applying pre-save hook directly to the schema
userSchema.pre('save', async function(next) {
    // 'this' refers to the current user document
    if (this.isModified('password')) {  // Directly use 'this'
        // Hash the password before saving it to the database with a salt round of 8
        this.password = await bcrypt.hash(this.password, 8);
    }

    next();  // Call the next middleware in the stack (to proceed with saving)
});

// Create and export the User model from the schema
const User = mongoose.model('User', userSchema);

export default User;
