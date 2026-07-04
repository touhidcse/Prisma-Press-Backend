import { NextFunction, Request, Response } from "express"
import { catchAsync } from "../../utils/catchAsync"
import { postService } from "./post.service"
import { sendResponse } from "../../utils/sendResponse"
import httpstatus from "http-status"



const createPost = catchAsync(async (req: Request, res: Response, next: NextFunction)=>{

    const id = req.user?.id

    const payload = req.body

    const result = await postService.createPost(payload,id as string)

    sendResponse(res,{
        success: true,
        statusCode: httpstatus.CREATED,
        message: "Post created Successfully",
        data: result

    })
})
const getAllPosts = catchAsync(async (req: Request, res: Response, next: NextFunction)=>{

    const result = await postService.getAllPosts()
    sendResponse(res, {
        success: true,
        statusCode: httpstatus.OK,
        message: " Data retrieved successfully",
        data: result
    })

})
const getPostStats = catchAsync(async (req: Request, res: Response, next: NextFunction)=>{

})
const getMyPosts = catchAsync(async (req: Request, res: Response, next: NextFunction)=>{

    const authorId = req.user?.id;
    const result= await postService.getMyPosts(authorId as string)

    sendResponse(res, {
        success: true,
        statusCode: httpstatus.OK,
        message: "My posts retrieved successfully",
        data: result
    })
})
const getPostById = catchAsync(async (req: Request, res: Response, next: NextFunction)=>{

    const postId = req.params.postId;
    if(!postId){
        throw new Error("Post Id requires in Params");
    }
    const result = await postService.getPostById(postId as string);

    sendResponse(res, {
        success: true,
        statusCode: httpstatus.OK,
        message: "Post retrieved Successfully",
        data: result
    })

})
const updatePost = catchAsync(async (req: Request, res: Response, next: NextFunction)=>{
    const authorId = req.user?.id;
    const isAdmin= req.user?.role ==="ADMIN";
    const postId = req.params.postId;

     if(!postId){
        throw new Error("Post Id requires in Params");
    }

    const payload = req.body;
    const result = await postService.updatePost(postId as string, payload, authorId as string,isAdmin)

      sendResponse(res, {
        success: true,
        statusCode: httpstatus.OK,
        message: "Post updated Successfully",
        data: result
    })

})
const deletePost = catchAsync(async (req: Request, res: Response, next: NextFunction)=>{

    const authorId = req.user?.id;
    const isAdmin= req.user?.role ==="ADMIN";
    const postId = req.params.postId;

     if(!postId){
        throw new Error("Post Id requires in Params");
    }

     await postService.deletePost(postId as string, authorId as string,isAdmin)

      sendResponse(res, {
        success: true,
        statusCode: httpstatus.OK,
        message: "Post deleted Successfully",
        data: null
    })
})

export const postController={
    createPost,
    getAllPosts,
    getPostStats,
    getMyPosts,
    getPostById,
    updatePost,
    deletePost
}