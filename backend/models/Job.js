import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
    Position: { type: String, required: true },
    Company: { type: String, required: true },
    Phase: { type: String, required: true },
    CL: { type: Boolean, required: true },
    Status: { type: Boolean, required: true },
    Note: { type: String, required: false },
    'Applied date': { type: String, required: true },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        require:true,
        ref: 'User'
    } // Usando aspas para campos com espaço
    
},
{
    timestamps:true
});



// Create and export the User model from the schema
const Job = mongoose.model('Job', jobSchema);

export default Job;
