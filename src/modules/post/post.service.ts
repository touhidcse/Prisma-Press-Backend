import { CommentStatus, PostStatus } from "../../../generated/prisma/enums";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma"
import { ICreatePostPayload, IPostQuery, IUpdatePostPayload } from "./post.interface"

const createPost = async (payload: ICreatePostPayload, userId: string) => {

    const user = await prisma.user.findFirstOrThrow({
        where: {
            id: userId
        },
        include:{
            subscription: true,
        },
    })

    if(payload.isPremium && user.subscription?.status !=="ACTIVE"){
        throw new Error("You are not premium user, thant's why you can not create premium content")
    }
    const result = await prisma.post.create({
        data: {
            ...payload,
            authorId: userId
        }
    })

    return result;

}




const getAllPosts = async ( query: IPostQuery) => {

    const limit = query.limit? Number(query.limit) : 10;
    const page = query.page? Number(query.page): 1;
    const skip = (page-1)*limit;
    const sortBy = query.sortBy? query.sortBy : "createdAt";
    const sortOrder = query.sortOrder? query.sortOrder: "desc"
    

    const tags = query.tags? JSON.parse(query.tags as string )  : null

    const tagsArray= Array.isArray(tags)? tags : []

    const andCondition : PostWhereInput[] = []

    if(query.searchTerm){
        andCondition.push({
            OR : [
                        {
                            title: {
                                contains: query.searchTerm,
                                mode: "insensitive"
                            }
                        },
                        {
                              content: {
                                contains: query.searchTerm,
                                mode: "insensitive"
                            }
                        }
                    ]
        })
    };
    if(query.title){
        andCondition.push({
            title: query.title
        })
    };

    if(query.content){
        andCondition.push({
            content: query.content
        })
    };

    if(query.authorId){
        andCondition.push({
            authorId: query.authorId
        })
    };

    if(query.isFeatured){
        andCondition.push({
            isFeatured: Boolean(query.isFeatured)
        })
    };

    if(query.tags){
        andCondition.push({
            tags: {
                hasSome: tagsArray
            }
        })
    };
    if(query.status){
        andCondition.push({
            status: query.status
        })
    };


    // premium content hide from gel all post
    andCondition.push({
        isPremium:false
    })

    const posts = await prisma.post.findMany({

        // Filtering or Exact match without AND
        // where:{
        //     title:"My fourth Post",
        //     content: "Ronaldo"
        // },
        // Filtering or Exact match with AND
        // where: {
        //     AND: [{
        //         title: "My fourth Post"
        //     },
        //     {
        //         content: "Ronaldo"
        //     },
        //     {
        //         tags: {
        //             equals: [
        //                 "typescript",
        //                 "prisma",
        //                 "express"
        //             ]
        //         }
        //     }
        //     ]
        // },

        // searching / partial match

        // where:{
        //     content: {
        //         contains: "Ronaldo",
        //         mode: "insensitive"
        //     },

        //     // Not Ideal match for partial match
        //     title: {
        //         contains: "Ronaldo"
        //     }
        // },

        // where: {
        //     OR: [{
        //         title: {
        //             contains: "Ronaldo",
        //             mode: "insensitive"
        //         }
        //     },

        //     {
        //         content:{
        //             contains: "Ronaldo",
        //             mode:"insensitive"
        //         }
        //     }]
        // },

        // combining search(OR operator) and filtering (AND operator)

        // where: {
        //     // filtering & searching combine
        //     AND: [

        //         // Searching
        //         {
        //             OR: [{
        //                 title: {
        //                     contains: "Ronaldo",
        //                     mode: "insensitive"
        //                 }
        //             },
        //             {
        //                 content: {
        //                     contains: "ronaldo",
        //                     mode: "insensitive"
        //                 }
        //             }]
        //         },

        //         // Filtering
        //         {
        //             title: {
        //                 contains: "Ronaldo"
        //             }
        //         },
        //         {
        //             content: {
        //                 contains: "Ronaldo  Najario"
        //             }
        //         }
        //     ]
        // },

        // pagination wiht limit/take and page/skip
        // take: 1,
        // // for first page skip : 0
        // skip: 1, // visit second page
        // // skip: 3, visist fourth page

        // // page =3, limit/take=10 => skip: (page-1)*take =>2*10=20


        // //
        // orderBy:{
        //     createdAt:"desc",
        //     title:"asc",
        //     content: "desc"
        //     // fieldName: asc/desc
        // },


        // Dynamic searching, filtering
       
        // where:{
        //     AND: [

        //         query.searchTerm? { 
        //             OR : [
        //                 {
        //                     title: {
        //                         contains: query.searchTerm,
        //                         mode: "insensitive"
        //                     }
        //                 },
        //                 {
        //                       content: {
        //                         contains: query.searchTerm,
        //                         mode: "insensitive"
        //                     }
        //                 }
        //             ]
        //         } : {},
        //         // tittle filtering
        //         query.title? {title: query.title} : {},
        //         //content filtering

        //         query.content?{content: query.content}: {},

        //     ]
        // },

        // Dynamic agination, sorting
        
        where:{
            AND: andCondition
        },
        take: limit,   // upore  calculate kora ace
        skip: skip,

        orderBy: {
            //sortBy: sortOrder
            [sortBy]: sortOrder

        },
        include: {
            author: {
                omit: {
                    password: true
                }
            },
            comments: true
        }
    })

    const totalPostCount = await prisma.post.count({
        where:{
            AND: andCondition
        }
    })
    return {
        data: posts,
        meta: {
            page: page,
            limit: limit,
            total: totalPostCount,
            totalPages: Math.ceil(totalPostCount/limit)
        }
    }

}

const getPostStats = async () => {

    const transactionResult = await prisma.$transaction(
        async (tx) => {
            // const totalPosts = await tx.post.count();
            // const totalPublishedPosts = await tx.post.count({
            //     where: {
            //         status: PostStatus.PUBLISHED
            //     }
            // });
            // const totalDraftPosts = await tx.post.count({
            //     where: {
            //         status: PostStatus.DRAFT
            //     }
            // });
            // const totalArchievedPosts = await tx.post.count({
            //     where: {
            //         status: PostStatus.ARCHIVED
            //     }
            // });
            // const totalComments = await tx.comment.count();
            // const totalApprovedComments = await tx.comment.count({
            //     where: {
            //         status: CommentStatus.APPROVED
            //     }
            // });
            // const totalRejectedComments = await tx.comment.count({
            //     where: {
            //         status: CommentStatus.REJECT
            //     }
            // });

            // // Not a good approach, havy time comsuming
            // // const allPosts = await tx.post.findMany();
            // // let totalPostViews = 0;
            // // allPosts.forEach((post)=>{
            // //     totalPostViews = totalPostViews + post.views;
            // // });

            // const totalPostViewsAggegate = await tx.post.aggregate({
            //     _sum: { views: true }
            // })

            // const totalPostViews = totalPostViewsAggegate._sum.views;

            // return {
            //     totalPosts,
            //     totalPublishedPosts,
            //     totalDraftPosts,
            //     totalArchievedPosts,
            //     totalComments,
            //     totalApprovedComments,
            //     totalRejectedComments,
            //     totalPostViews
            // }

            const [
                totalPosts,
                totalPublishedPosts,
                totalDraftPosts,
                totalArchievedPosts,
                totalComments,
                totalApprovedComments,
                totalRejectedComments,
                totalPostViewsAggegate
            ] = await Promise.all([
                await tx.post.count(),
                await tx.post.count({
                    where: {
                        status: PostStatus.PUBLISHED
                    }
                }),
                await tx.post.count({
                    where: {
                        status: PostStatus.DRAFT
                    }
                }),
                await tx.post.count({
                    where: {
                        status: PostStatus.ARCHIVED
                    }
                }),
                await tx.comment.count(),
                await tx.comment.count({
                    where: {
                        status: CommentStatus.APPROVED
                    }
                }),
                await tx.comment.count({
                    where: {
                        status: CommentStatus.REJECT
                    }
                }),
                await tx.post.aggregate({
                    _sum: { views: true }
                })
            ]);

            return {
                totalPosts,
                totalPublishedPosts,
                totalDraftPosts,
                totalArchievedPosts,
                totalComments,
                totalApprovedComments,
                totalRejectedComments,
                totalPostViews: totalPostViewsAggegate._sum.views
            }
        }
    );
    return transactionResult;

}

const getMyPosts = async (authorId: string) => {
    const result = await prisma.post.findMany({
        where: {
            authorId,
        },

        orderBy: {
            createdAt: "desc"
        },

        include: {
            comments: true,
            author: {
                omit: {
                    password: true,
                }
            },
            _count: {
                select: {
                    comments: true
                }
            }
        }
    });

    return result;
}

// const getPostById =  async ( postId : string) => {
//     const post = await prisma.post.findUniqueOrThrow({
//         where: {
//             id: postId
//         }
//     })
//     const updatedPost = await prisma.post.update({
//         where: {
//             id: postId,
//         },
//         data: {
//             views: {
//                 increment: 1
//             },
//         },
//         include: {
//             author: {
//                 omit: {
//                     password: true,
//                 }
//             },
//             comments: true
//         }
//     })
//     return updatedPost;
// }
// 


// const getPostById = async (postId: string) => {

//     await prisma.post.update({
//         where: {
//             id: postId,
//         },
//         data: {
//             views: {
//                 increment: 1
//             },
//         },
//     })

//     throw new Error("Fake")

//     const post = await prisma.post.findUniqueOrThrow({
//         where: {
//             id: postId
//         },
//         include: {
//             author: {
//                 omit: {
//                     password: true,
//                 }
//             },
//             comments: {
//                 where: {
//                     status: CommentStatus.APPROVED
//                 },
//                 orderBy: {
//                     createdAt: "desc"
//                 }
//             },
//             _count: {
//                 select: {
//                     comments: true
//                 }
//             }
//         }
//     })
//     return post;
// }

// Understanding The Scenario For Transaction And Rollback

const getPostById = async (postId: string) => {

    const transactionResult = await prisma.$transaction(
        async (tx) => {
            await tx.post.update({
                where: {
                    id: postId,
                    
                },
                data: {
                    views: {
                        increment: 1
                    },
                },
            });

            // throw new Error("Fake Error")
            const post = await tx.post.findUniqueOrThrow({
                where: {
                    id: postId,
                    isPremium: false
                },
                include: {
                    author: {
                        omit: {
                            password: true,
                        }
                    },
                    comments: {
                        where: {
                            status: CommentStatus.APPROVED
                        },
                        orderBy: {
                            createdAt: "desc"
                        }
                    },
                    _count: {
                        select: {
                            comments: true
                        }
                    }
                }

            });

            return post;
        }
    )

    return transactionResult;
}

// Understanding The Scenario For Transaction And Rollback

const updatePost = async (postId: string, payload: IUpdatePostPayload, authorId: string, isAdmin: boolean) => {

    const post = await prisma.post.findFirstOrThrow({
        where: {
            id: postId
        }
    })

    if (!isAdmin && post.authorId !== authorId) {
        throw new Error("You are not the owner of this post!")
    }

    const result = await prisma.post.update({
        where: {
            id: postId,
        },
        data: payload,
        include: {
            author: {
                omit: {

                    password: true
                }
            },
            comments: true,
        }
    });

    return result;
}

const deletePost = async (postId: string, authorId: string, isAdmin: boolean) => {

    const post = await prisma.post.findFirstOrThrow({
        where: {
            id: postId
        }
    })

    if (!isAdmin && post.authorId !== authorId) {
        throw new Error("You are not the owner of this post!")
    }

    await prisma.post.delete({
        where: {
            id: postId,
        },
    })

}


export const postService = {
    createPost,
    getAllPosts,
    getPostStats,
    getMyPosts,
    getPostById,
    updatePost,
    deletePost
}