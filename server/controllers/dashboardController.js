// const Note=require('../models/Notes');
// const mongoose= require('mongoose');


// /**
//  * GET /
//  * Dashboard
//  */

// exports.dashboard=async(req,res)=>{
//     let perPage=12;
//     let page=req.query.page || 1
//     const locals={
//         title: 'Dashboard',
//         description:' Free NodeJs Notes App'
//     };
//     try {
        
//        Note.aggregate([
//         {
//         $sort:{
//             createdAt:-1,
//         }
//        },
//        {$match:{ user:new mongoose.Types.ObjectId(req.user.id) }},
//        {
//         $project:{
//             title:{$substr:['$title',0,30]},
//             body:{$substr:['$body',0,100]},
//         },
//        },
//     ])
//     .skip(perPage *page-perPage)
//     .limit(perPage)
//     .exec(function(err,notes){
//     Note.count().exec(function(err,count) {
//         if(err) return next(err);

//         res.render('dashboard/index',{
//             userName: req.user.firstName,
//             locals,
//             notes,
//             layout:'../views/layouts/dashboard',
//             current: page,
//             pages: Math.ceil(count/perPage)
//         });
//     })
//     })
        
//     } catch (error) {
//         console.log(error);
//     }
    
// }
const Note = require('../models/Notes');
const mongoose = require('mongoose');

/**
 * GET /
 * Dashboard
 */
exports.dashboard = async (req, res, next) => {
    let perPage = 12;
    let page = parseInt(req.query.page) || 1;

    const locals = {
        title: 'Dashboard',
        description: 'Free NodeJs Notes App',
    };

    try {
        // Ensure user ID is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
            return res.status(400).json({ error: "Invalid user ID format" });
        }
        const userId = new mongoose.Types.ObjectId(req.user.id);

        // Aggregation Pipeline with $match, $sort, $project, $skip, and $limit
        const notes = await Note.aggregate([
            { $match: { user: userId } },
            { $sort: { createdAt: -1 } },
            { 
                $project: {
                    title: { $substr: ["$title", 0, 30] },
                    body: { $substr: ["$body", 0, 100] },
                }
            },
            { $skip: (perPage * (page - 1)) },
            { $limit: perPage }
        ]);

        // Count total notes for pagination
        const count = await Note.countDocuments({ user: userId });

        res.render('dashboard/index', {
            userName: req.user.firstName,
            locals,
            notes,
            layout: '../views/layouts/dashboard',
            current: page,
            pages: Math.ceil(count / perPage),
        });

    } catch (error) {
        console.error(error);
        next(error); // Pass error to Express error handler
    }
};
