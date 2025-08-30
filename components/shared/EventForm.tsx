"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { eventFormSchema } from "@/lib/validator"
import * as z from "zod"
import { eventDefaultValues } from "@/constants"
import Dropdown from "./Dropdown"
import { Textarea } from "@/components/ui/textarea"
import { FileUploader } from "./FileUploader"
import { useState, useEffect } from "react"
import Image from "next/image"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { Checkbox } from "@/components/ui/checkbox"
import { useUploadThing } from "@/lib/uploadthing"
import { useRouter } from "next/navigation"
import { IEvent } from "@/lib/database/models/event.model"
import { createEvent, updateEvent, createEventSimple } from "@/lib/actions/event.actions"
import { useUser } from "@clerk/nextjs"
import { getUserByClerkId } from "@/lib/actions/user.actions"

type EventFormProps = {
  userId: string
  type: "Create" | "Update"
  event?: IEvent,
  eventId?: string
}

const EventForm = ({ userId, type, event, eventId }: EventFormProps) => {
  const [files, setFiles] = useState<File[]>([])
  const router = useRouter();
  const { startUpload } = useUploadThing('imageUploader')
  const { user } = useUser();

  console.log('EventForm - Received userId:', userId);

  const initialValues = event && type === 'Update' 
    ? { 
        ...event, 
        startDateTime: new Date(event.startDateTime), 
        endDateTime: new Date(event.endDateTime) 
      }
    : eventDefaultValues;

  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: initialValues
  })

  async function onSubmit(values: z.infer<typeof eventFormSchema>) {
    console.log('Form submitted with values:', values); // Debug log
    
    if (!user) {
      console.error('No user found');
      return;
    }

    try {
      // Get the MongoDB userId using the Clerk ID
      const mongoUser = await getUserByClerkId(user.id);
      const mongoUserId = mongoUser._id;
      
      console.log('Clerk ID:', user.id);
      console.log('MongoDB User ID:', mongoUserId);
      
      let uploadedImageUrl = values.imageUrl;

      if (files.length > 0) {
        console.log('Uploading files:', files); // Debug log
        const uploadedImages = await startUpload(files)

        if (!uploadedImages) {
          console.error('Image upload failed'); // Debug log
          return 
        }

        uploadedImageUrl = uploadedImages[0].url
        console.log('Image uploaded successfully:', uploadedImageUrl); // Debug log
      }

      if (type === 'Create') {
        try {
          console.log('Creating event with data:', { ...values, imageUrl: uploadedImageUrl });
          
          // Use the simplified create function that works with Clerk ID  
          const newEvent = await createEventSimple({
            clerkUserId: userId, // Use the userId passed from the page
            event: { ...values, imageUrl: uploadedImageUrl },
            path: '/profile'
          })
          
          console.log('Event created successfully:', newEvent);
          
          if (newEvent) {
            form.reset();
            router.push(`/events/${newEvent._id}`)
          }
        } catch (error) {
          console.error('Error creating event:', error);
          alert('Failed to create event: ' + (error as Error).message);
        }
      }

      if (type === 'Update') {
        if (!eventId) {
          router.back()
          return;
        }

        try {
          console.log('Updating event with data:', { ...values, imageUrl: uploadedImageUrl });
          
          const updatedEvent = await updateEvent({
            userId: user.id, // Use Clerk ID for now
            event: { 
              ...values, 
              imageUrl: uploadedImageUrl, 
              _id: eventId,
              url: values.url || ''
            },
            path: `/events/${eventId}`
          })

          if (updatedEvent) {
            form.reset();
            router.push(`/events/${updatedEvent._id}`)
          }
        } catch (error) {
          console.error('Error updating event:', error);
          alert('Failed to update event: ' + (error as Error).message);
        }
      }
    } catch (error) {
      console.error('Error getting MongoDB user:', error);
      alert('User not found. Please make sure you are properly registered.');
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input placeholder="Event title" {...field} 
                    className="input-field" />
                </FormControl> 
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem className="w-full"> 
                <FormControl>
                  <Dropdown onChangeHandler={field.onChange} value={field.value} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl className="h-72">
                  <Textarea placeholder="Description" {...field} 
                    className="textarea rounded-2xl" />
                </FormControl> 
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl className="h-72">
                  <FileUploader
                    onFieldChange={field.onChange}
                    imageUrl={field.value}
                    setFiles={setFiles}
                  />
                </FormControl> 
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <div className="flex-center h-[54px] w-full 
                    overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                    <Image 
                      src="/location-grey.svg"
                      alt="location"
                      width={24}
                      height={24}
                    />
                    <Input placeholder="Event location or Online" {...field} 
                      className="input-field" />
                  </div>
                </FormControl> 
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="startDateTime"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <div className="flex-center h-[54px] w-full 
                    overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                    <Image 
                      src="/calendar.svg"
                      alt="calendar"
                      width={24}
                      height={24}
                      className="filter-grey"
                    />
                    <p className="ml-3 whitespace-nowrap text-grey-600">Start Date:</p>
                    <DatePicker 
                      selected={field.value} 
                      onChange={(date: Date | null) => field.onChange(date)}
                      showTimeSelect
                      timeInputLabel="Time:"
                      dateFormat="MM/dd/yyyy h:mm aa"
                      wrapperClassName="datePicker"
                    />
                  </div>
                </FormControl> 
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDateTime"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <div className="flex-center h-[54px] w-full 
                    overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                    <Image 
                      src="/calendar.svg"
                      alt="calendar"
                      width={24}
                      height={24}
                      className="filter-grey"
                    />
                    <p className="ml-3 whitespace-nowrap text-grey-600">End Date:</p>
                    <DatePicker 
                      selected={field.value} 
                      onChange={(date: Date | null) => field.onChange(date)}
                      showTimeSelect
                      timeInputLabel="Time:"
                      dateFormat="MM/dd/yyyy h:mm aa"
                      wrapperClassName="datePicker"
                    />
                  </div>
                </FormControl> 
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                    <Image
                      src="/dollar.svg"
                      alt="dollar"
                      width={24}
                      height={24}
                      className="filter-grey"
                    />
                    <Input type="number" placeholder="Price" {...field} 
                      className="p-regular-16 border-0 bg-grey-50 outline-offset-0 focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0" />
                    <FormField
                      control={form.control}
                      name="isFree"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="flex items-center">
                              <label htmlFor="isFree" className="whitespace-nowrap pr-3 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Free Ticket
                              </label>
                              <Checkbox
                                onCheckedChange={field.onChange}
                                checked={field.value}
                                id="isFree" 
                                className="mr-2 h-5 w-5 border-2 border-primary-500" 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />   
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
                    <Image
                      src="/link.svg"
                      alt="link"
                      width={24}
                      height={24}
                    />
                    <Input placeholder="URL" {...field} className="input-field" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />   
        </div>
        
        <Button 
          type="submit"
          size="lg"
          disabled={form.formState.isSubmitting}
          className="button col-span-2 w-full"
        >
          {form.formState.isSubmitting ? (
            'Submitting...'
          ) : `${type} Event`}
        </Button>
      </form>
    </Form>
  )
}

export default EventForm
// "use client"

// import { zodResolver } from "@hookform/resolvers/zod"
// import { useForm } from "react-hook-form"
// import { Button } from "@/components/ui/button"
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormMessage,
// } from "@/components/ui/form"
// import { Input } from "@/components/ui/input"
// import { eventFormSchema } from "@/lib/validator"
// import * as z from "zod"
// import { eventDefaultValues } from "@/constants"
// import Dropdown from "./Dropdown"
// import { Textarea } from "@/components/ui/textarea"
// import { FileUploader } from "./FileUploader"
// import { useState, useEffect } from "react"
// import Image from "next/image"
// import DatePicker from "react-datepicker"
// import "react-datepicker/dist/react-datepicker.css"
// import { Checkbox } from "@/components/ui/checkbox"
// import { useUploadThing } from "@/lib/uploadthing"
// import { useRouter } from "next/navigation"
// import { IEvent } from "@/lib/database/models/event.model"
// import { createEvent, updateEvent, createEventSimple } from "@/lib/actions/event.actions"
// import { useUser } from "@clerk/nextjs"
// import { getUserByClerkId } from "@/lib/actions/user.actions"

// type EventFormProps = {
//   userId: string
//   type: "Create" | "Update"
//   event?: IEvent,
//   eventId?: string
// }

// const EventForm = ({ userId: propUserId, type, event, eventId }: EventFormProps) => {
//   const [files, setFiles] = useState<File[]>([])
//   const router = useRouter();
//   const { startUpload } = useUploadThing('imageUploader')
//   const { user, isLoaded } = useUser(); // Get user from Clerk

//   if (!isLoaded) {
//     return <div>Loading...</div>;
//   }

//   if (!user) {
//     return <div>Please sign in to create an event.</div>;
//   }

//   const initialValues = event && type === 'Update' 
//     ? { 
//         ...event, 
//         startDateTime: new Date(event.startDateTime), 
//         endDateTime: new Date(event.endDateTime) 
//       }
//     : eventDefaultValues;

//   const form = useForm<z.infer<typeof eventFormSchema>>({
//     resolver: zodResolver(eventFormSchema),
//     defaultValues: initialValues
//   })

//   async function onSubmit(values: z.infer<typeof eventFormSchema>) {
//     console.log('Form submitted with values:', values); // Debug log
    
//     if (!user) {
//       console.error('No user found');
//       return;
//     }

//     try {
//       // Get the MongoDB userId using the Clerk ID
//       const mongoUser = await getUserByClerkId(user.id);
//       const mongoUserId = mongoUser._id;
      
//       console.log('Clerk ID:', user.id);
//       console.log('MongoDB User ID:', mongoUserId);
      
//       let uploadedImageUrl = values.imageUrl;

//       if (files.length > 0) {
//         console.log('Uploading files:', files); // Debug log
//         const uploadedImages = await startUpload(files)

//         if (!uploadedImages) {
//           console.error('Image upload failed'); // Debug log
//           return 
//         }

//         uploadedImageUrl = uploadedImages[0].url
//         console.log('Image uploaded successfully:', uploadedImageUrl); // Debug log
//       }

//       if (type === 'Create') {
//         try {
//           console.log('Creating event with data:', { ...values, imageUrl: uploadedImageUrl });
          
//           // Use the simplified create function that works with Clerk ID
//           const newEvent = await createEventSimple({
//             clerkUserId: user.id,
//             event: { ...values, imageUrl: uploadedImageUrl },
//             path: '/profile'
//           })
          
//           console.log('Event created successfully:', newEvent);
          
//           if (newEvent) {
//             form.reset();
//             router.push(`/events/${newEvent._id}`)
//           }
//         } catch (error) {
//           console.error('Error creating event:', error);
//           alert('Failed to create event: ' + (error as Error).message);
//         }
//       }

//       if (type === 'Update') {
//         if (!eventId) {
//           router.back()
//           return;
//         }

//         try {
//           console.log('Updating event with data:', { ...values, imageUrl: uploadedImageUrl });
          
//           const updatedEvent = await updateEvent({
//             userId: user.id, // Use Clerk ID for now
//             event: { 
//               ...values, 
//               imageUrl: uploadedImageUrl, 
//               _id: eventId,
//               url: values.url || ''
//             },
//             path: `/events/${eventId}`
//           })

//           if (updatedEvent) {
//             form.reset();
//             router.push(`/events/${updatedEvent._id}`)
//           }
//         } catch (error) {
//           console.error('Error updating event:', error);
//           alert('Failed to update event: ' + (error as Error).message);
//         }
//       }
//     } catch (error) {
//       console.error('Error getting MongoDB user:', error);
//       alert('User not found. Please make sure you are properly registered.');
//     }
//   }

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
//         <div className="flex flex-col gap-5 md:flex-row">
//           <FormField
//             control={form.control}
//             name="title"
//             render={({ field }) => (
//               <FormItem className="w-full">
//                 <FormControl>
//                   <Input placeholder="Event title" {...field} 
//                     className="input-field" />
//                 </FormControl> 
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <FormField
//             control={form.control}
//             name="categoryId"
//             render={({ field }) => (
//               <FormItem className="w-full"> 
//                 <FormControl>
//                   <Dropdown onChangeHandler={field.onChange} value={field.value} />
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         </div>
        
//         <div className="flex flex-col gap-5 md:flex-row">
//           <FormField
//             control={form.control}
//             name="description"
//             render={({ field }) => (
//               <FormItem className="w-full">
//                 <FormControl className="h-72">
//                   <Textarea placeholder="Description" {...field} 
//                     className="textarea rounded-2xl" />
//                 </FormControl> 
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <FormField
//             control={form.control}
//             name="imageUrl"
//             render={({ field }) => (
//               <FormItem className="w-full">
//                 <FormControl className="h-72">
//                   <FileUploader
//                     onFieldChange={field.onChange}
//                     imageUrl={field.value}
//                     setFiles={setFiles}
//                   />
//                 </FormControl> 
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         </div>
        
//         <div className="flex flex-col gap-5 md:flex-row">
//           <FormField
//             control={form.control}
//             name="location"
//             render={({ field }) => (
//               <FormItem className="w-full">
//                 <FormControl>
//                   <div className="flex-center h-[54px] w-full 
//                     overflow-hidden rounded-full bg-grey-50 px-4 py-2">
//                     <Image 
//                       src="/location-grey.svg"
//                       alt="location"
//                       width={24}
//                       height={24}
//                     />
//                     <Input placeholder="Event location or Online" {...field} 
//                       className="input-field" />
//                   </div>
//                 </FormControl> 
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         </div>

//         <div className="flex flex-col gap-5 md:flex-row">
//           <FormField
//             control={form.control}
//             name="startDateTime"
//             render={({ field }) => (
//               <FormItem className="w-full">
//                 <FormControl>
//                   <div className="flex-center h-[54px] w-full 
//                     overflow-hidden rounded-full bg-grey-50 px-4 py-2">
//                     <Image 
//                       src="/calendar.svg"
//                       alt="calendar"
//                       width={24}
//                       height={24}
//                       className="filter-grey"
//                     />
//                     <p className="ml-3 whitespace-nowrap text-grey-600">Start Date:</p>
//                     <DatePicker 
//                       selected={field.value} 
//                       onChange={(date: Date | null) => field.onChange(date)}
//                       showTimeSelect
//                       timeInputLabel="Time:"
//                       dateFormat="MM/dd/yyyy h:mm aa"
//                       wrapperClassName="datePicker"
//                     />
//                   </div>
//                 </FormControl> 
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <FormField
//             control={form.control}
//             name="endDateTime"
//             render={({ field }) => (
//               <FormItem className="w-full">
//                 <FormControl>
//                   <div className="flex-center h-[54px] w-full 
//                     overflow-hidden rounded-full bg-grey-50 px-4 py-2">
//                     <Image 
//                       src="/calendar.svg"
//                       alt="calendar"
//                       width={24}
//                       height={24}
//                       className="filter-grey"
//                     />
//                     <p className="ml-3 whitespace-nowrap text-grey-600">End Date:</p>
//                     <DatePicker 
//                       selected={field.value} 
//                       onChange={(date: Date | null) => field.onChange(date)}
//                       showTimeSelect
//                       timeInputLabel="Time:"
//                       dateFormat="MM/dd/yyyy h:mm aa"
//                       wrapperClassName="datePicker"
//                     />
//                   </div>
//                 </FormControl> 
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//         </div>

//         <div className="flex flex-col gap-5 md:flex-row">
//           <FormField
//             control={form.control}
//             name="price"
//             render={({ field }) => (
//               <FormItem className="w-full">
//                 <FormControl>
//                   <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
//                     <Image
//                       src="/dollar.svg"
//                       alt="dollar"
//                       width={24}
//                       height={24}
//                       className="filter-grey"
//                     />
//                     <Input type="number" placeholder="Price" {...field} 
//                       className="p-regular-16 border-0 bg-grey-50 outline-offset-0 focus:border-0 focus-visible:ring-0 focus-visible:ring-offset-0" />
//                     <FormField
//                       control={form.control}
//                       name="isFree"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormControl>
//                             <div className="flex items-center">
//                               <label htmlFor="isFree" className="whitespace-nowrap pr-3 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
//                                 Free Ticket
//                               </label>
//                               <Checkbox
//                                 onCheckedChange={field.onChange}
//                                 checked={field.value}
//                                 id="isFree" 
//                                 className="mr-2 h-5 w-5 border-2 border-primary-500" 
//                               />
//                             </div>
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />   
//                   </div>
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />
//           <FormField
//             control={form.control}
//             name="url"
//             render={({ field }) => (
//               <FormItem className="w-full">
//                 <FormControl>
//                   <div className="flex-center h-[54px] w-full overflow-hidden rounded-full bg-grey-50 px-4 py-2">
//                     <Image
//                       src="/link.svg"
//                       alt="link"
//                       width={24}
//                       height={24}
//                     />
//                     <Input placeholder="URL" {...field} className="input-field" />
//                   </div>
//                 </FormControl>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />   
//         </div>
        
//         <Button 
//           type="submit"
//           size="lg"
//           disabled={form.formState.isSubmitting}
//           className="button col-span-2 w-full"
//         >
//           {form.formState.isSubmitting ? (
//             'Submitting...'
//           ) : `${type} Event`}
//         </Button>
//       </form>
//     </Form>
//   )
// }

// export default EventForm
