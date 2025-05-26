import { Description } from "@radix-ui/react-dialog"
import { title } from "process"
import * as z from "zod"
import mongoose from "mongoose"

export const eventFormSchema = z.object({
   title: z.string().min(3, 'Title must be at least 3 characters'),
   description: z.string().min(3, 'Description must be at least 3 characters').max(400,'Description must be less than 400 charaters'),
   location: z.string().min(3,'Location must be at least 3 characters ').max(400,'Location must be less than 400 characters'),
   imageUrl:z.string(),
   startDateTime:z.date(),
   endDateTime:z.date(),
   categoryId:z.string(),
   price: z.string(),
   isFree: z.boolean(),
   url: z.string().url()
})  

