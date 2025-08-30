// "use server"

// import { connectToDatabase } from "../database"
// import { handleError } from "../utils";
// import { CreateEventParams, DeleteEventParams, GetAllEventsParams, GetRelatedEventsByCategoryParams, UpdateEventParams } from "../types";
// import User from "../database/models/user.model";
// import Event from "../database/models/event.model";
// import { revalidatePath } from "next/cache";
// import Category from "../database/models/category.model";
// import mongoose from "mongoose";
// import { isValidObjectId } from "mongoose";

// const populateEvent = (query: any) => {
//     return query
//       .populate({ path: 'organizer', model: User, select: '_id firstName lastName' })
//       .populate({ path: 'category', model: Category, select: '_id name' })
//   }

// const getCategoryByName = async (name: string) => {
//     return Category.findOne({ name: { $regex: name, $options: 'i' } })
//   }
  

//   export const createEvent = async ({ userId, event, path }: CreateEventParams) => {
//     try {
//       await connectToDatabase()
  
//       const organizer = await User.findById(userId)
//       if (!organizer) throw new Error('Organizer not found')
  
//       const newEvent = await Event.create({ ...event, category: event.categoryId, organizer: userId })
//       revalidatePath(path)
  
//       return JSON.parse(JSON.stringify(newEvent))
//     } catch (error) {
//       handleError(error)
//     }
//   }


// export const getEventById = async (eventId: string)=>  {
//     try {
//       await connectToDatabase()
  
//       const event = await populateEvent(Event.findById(eventId))
  
//       if (!event) throw new Error('Event not found')
  
//       return JSON.parse(JSON.stringify(event))
//     } catch (error) {
//       handleError(error)
//     }
//   }

// export async function getAllEvents({ query, limit = 6, page, category }: GetAllEventsParams) {
//     try {
//       await connectToDatabase()
  
//       const titleCondition = query ? { title: { $regex: query, $options: 'i' } } : {}
//       const categoryCondition = category ? await getCategoryByName(category) : null
//       const conditions = {
//         $and: [titleCondition, categoryCondition ? { category: categoryCondition._id } : {}],
//       }
  
//       const skipAmount = (Number(page) - 1) * limit
//       const eventsQuery = Event.find(conditions)
//         .sort({ createdAt: 'desc' })
//         .skip(skipAmount)
//         .limit(limit)
  
//       const events = await populateEvent(eventsQuery)
//       const eventsCount = await Event.countDocuments(conditions)
  
//       return {
//         data: JSON.parse(JSON.stringify(events)),
//         totalPages: Math.ceil(eventsCount / limit),
//       }
//     } catch (error) {
//       handleError(error)
//     }
//   }
//   export async function updateEvent({ userId, event, path }: UpdateEventParams) {
//     try {
//       await connectToDatabase()
  
//       const eventToUpdate = await Event.findById(event._id)
//       if (!eventToUpdate || eventToUpdate.organizer.toHexString() !== userId) {
//         throw new Error('Unauthorized or event not found')
//       }
  
//       const updatedEvent = await Event.findByIdAndUpdate(
//         event._id,
//         { ...event, category: event.categoryId },
//         { new: true }
//       )
//       revalidatePath(path)
  
//       return JSON.parse(JSON.stringify(updatedEvent))
//     } catch (error) {
//       handleError(error)
//     }
//   }
  
// // DELETE
// export async function deleteEvent({ eventId, path }: DeleteEventParams) {
//   try {
//     await connectToDatabase()

//     const deletedEvent = await Event.findByIdAndDelete(eventId)
//     if (deletedEvent) revalidatePath(path)
//   } catch (error) {
//     handleError(error)
//   }
// }

// export async function getRelatedEventsByCategory({
//   categoryId,
//   eventId,
//   limit = 3,
//   page = 1,
// }: GetRelatedEventsByCategoryParams) {
//   try {
//     await connectToDatabase()

//     const skipAmount = (Number(page) - 1) * limit
//     const conditions = { $and: [{ category: categoryId }, { _id: { $ne: eventId } }] }

//     const eventsQuery = Event.find(conditions)
//       .sort({ createdAt: 'desc' })
//       .skip(skipAmount)
//       .limit(limit)

//     const events = await populateEvent(eventsQuery)
//     const eventsCount = await Event.countDocuments(conditions)

//     return { data: JSON.parse(JSON.stringify(events)), totalPages: Math.ceil(eventsCount / limit) }
//   } catch (error) {
//     handleError(error)
//   }
// }

"use server"

import { connectToDatabase } from "../database"
import { handleError } from "../utils";
import { CreateEventParams, DeleteEventParams, GetAllEventsParams, GetRelatedEventsByCategoryParams, UpdateEventParams } from "../types";
import User from "../database/models/user.model";
import Event from "../database/models/event.model";
import { revalidatePath } from "next/cache";
import Category from "../database/models/category.model";
import mongoose from "mongoose";

const populateEvent = (query: any) => {
    return query
      .populate({ path: 'organizer', model: User, select: '_id firstName lastName' })
      .populate({ path: 'category', model: Category, select: '_id name' })
}

const getCategoryByName = async (name: string) => {
    return Category.findOne({ name: { $regex: name, $options: 'i' } })
}

export const createEventWithClerkId = async ({ clerkUserId, event, path }: { clerkUserId: string, event: any, path: string }) => {
  try {
    console.log('=== CREATE EVENT WITH CLERK ID ===');
    console.log('Clerk User ID:', clerkUserId);
    console.log('Event data:', event);

    await connectToDatabase();
    console.log('✅ Database connected');

    // Find organizer by Clerk ID instead of MongoDB _id
    const organizer = await User.findOne({ clerkId: clerkUserId });
    console.log('Organizer found:', organizer ? `${organizer.firstName} ${organizer.lastName}` : 'Not found');
    
    if (!organizer) {
      throw new Error(`Organizer not found for Clerk ID: ${clerkUserId}`);
    }

    // Check category exists
    const category = await Category.findById(event.categoryId);
    if (!category) {
      throw new Error(`Category not found for categoryId: ${event.categoryId}`);
    }

    // Create event with MongoDB organizer _id
    const eventData = {
      ...event,
      category: event.categoryId,
      organizer: organizer._id // Use MongoDB _id for organizer
    };

    console.log('Creating event with data:', eventData);
    const newEvent = await Event.create(eventData);
    console.log('✅ Event created:', newEvent._id);

    revalidatePath(path);
    return JSON.parse(JSON.stringify(newEvent));
  } catch (error) {
    console.error('❌ Error creating event:', error);
    throw new Error(`Failed to create event: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export const createEvent = async ({ userId, event, path }: CreateEventParams) => {
  try {
    console.log('=== CREATE EVENT DEBUG ===');
    console.log('UserId:', userId);
    console.log('Event data:', event);
    console.log('Path:', path);

    // Connect to database
    await connectToDatabase();
    console.log('✅ Database connected');

    // Find organizer
    const organizer = await User.findById(userId);
    console.log('Organizer found:', organizer ? 'Yes' : 'No');
    
    if (!organizer) {
      console.error('❌ Organizer not found for userId:', userId);
      throw new Error('Organizer not found');
    }

    // Validate categoryId
    if (!event.categoryId) {
      console.error('❌ No categoryId provided');
      throw new Error('Category is required');
    }

    // Check if category exists
    const category = await Category.findById(event.categoryId);
    console.log('Category found:', category ? category.name : 'No');
    
    if (!category) {
      console.error('❌ Category not found for categoryId:', event.categoryId);
      throw new Error('Category not found');
    }

    // Prepare event data
    const eventData = {
      ...event,
      category: event.categoryId,
      organizer: userId
    };
    
    console.log('Final event data to save:', eventData);

    // Create event
    const newEvent = await Event.create(eventData);
    console.log('✅ Event created successfully:', newEvent._id);

    // Revalidate path
    revalidatePath(path);
    console.log('✅ Path revalidated');

    const result = JSON.parse(JSON.stringify(newEvent));
    console.log('✅ Returning event:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Error in createEvent:', error);
    handleError(error);
    throw error; // Re-throw so the form can handle it
  }
}

export const getEventById = async (eventId: string) => {
  try {
    await connectToDatabase()

    const event = await populateEvent(Event.findById(eventId))

    if (!event) throw new Error('Event not found')

    return JSON.parse(JSON.stringify(event))
  } catch (error) {
    handleError(error)
  }
}

export async function getAllEvents({ query, limit = 6, page, category }: GetAllEventsParams) {
  try {
    await connectToDatabase()

    const titleCondition = query ? { title: { $regex: query, $options: 'i' } } : {}
    const categoryCondition = category ? await getCategoryByName(category) : null
    const conditions = {
      $and: [titleCondition, categoryCondition ? { category: categoryCondition._id } : {}],
    }

    const skipAmount = (Number(page) - 1) * limit
    const eventsQuery = Event.find(conditions)
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit)

    const events = await populateEvent(eventsQuery)
    const eventsCount = await Event.countDocuments(conditions)

    return {
      data: JSON.parse(JSON.stringify(events)),
      totalPages: Math.ceil(eventsCount / limit),
    }
  } catch (error) {
    handleError(error)
  }
}

export async function updateEvent({ userId, event, path }: UpdateEventParams) {
  try {
    await connectToDatabase()

    const eventToUpdate = await Event.findById(event._id)
    if (!eventToUpdate || eventToUpdate.organizer.toHexString() !== userId) {
      throw new Error('Unauthorized or event not found')
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      event._id,
      { ...event, category: event.categoryId },
      { new: true }
    )
    revalidatePath(path)

    return JSON.parse(JSON.stringify(updatedEvent))
  } catch (error) {
    handleError(error)
  }
}

// DELETE
export async function deleteEvent({ eventId, path }: DeleteEventParams) {
  try {
    await connectToDatabase()

    const deletedEvent = await Event.findByIdAndDelete(eventId)
    if (deletedEvent) revalidatePath(path)
  } catch (error) {
    handleError(error)
  }
}

export async function getRelatedEventsByCategory({
  categoryId,
  eventId,
  limit = 3,
  page = 1,
}: GetRelatedEventsByCategoryParams) {
  try {
    await connectToDatabase()

    const skipAmount = (Number(page) - 1) * limit
    const conditions = { $and: [{ category: categoryId }, { _id: { $ne: eventId } }] }

    const eventsQuery = Event.find(conditions)
      .sort({ createdAt: 'desc' })
      .skip(skipAmount)
      .limit(limit)

    const events = await populateEvent(eventsQuery)
    const eventsCount = await Event.countDocuments(conditions)

    return { data: JSON.parse(JSON.stringify(events)), totalPages: Math.ceil(eventsCount / limit) }
  } catch (error) {
    handleError(error)
  }
}

// Add this function to your event.actions.ts

export const createEventSimple = async ({ clerkUserId, event, path }: { clerkUserId: string, event: any, path: string }) => {
  try {
    console.log('=== SIMPLE CREATE EVENT ===');
    console.log('Clerk User ID:', clerkUserId);
    console.log('Event data received:', JSON.stringify(event, null, 2));

    await connectToDatabase();
    console.log('✅ Database connected');

    // Find the MongoDB user by Clerk ID
    const mongoUser = await User.findOne({ clerkId: clerkUserId });
    console.log('MongoDB user found:', mongoUser ? `${mongoUser.firstName} ${mongoUser.lastName} (${mongoUser._id})` : 'Not found');
    
    if (!mongoUser) {
      throw new Error(`No MongoDB user found for Clerk ID: ${clerkUserId}`);
    }

    // Validate required fields
    if (!event.title) throw new Error('Title is required');
    if (!event.categoryId) throw new Error('Category is required');
    if (!event.startDateTime) throw new Error('Start date is required');
    if (!event.endDateTime) throw new Error('End date is required');

    // Check if category exists
    const category = await Category.findById(event.categoryId);
    console.log('Category found:', category ? category.name : 'Not found');
    
    if (!category) {
      // List available categories for debugging
      const availableCategories = await Category.find({});
      console.log('Available categories:', availableCategories.map(c => `${c.name} (${c._id})`));
      throw new Error(`Category not found. Available categories: ${availableCategories.map(c => c.name).join(', ')}`);
    }

    // Prepare clean event data
    const cleanEventData = {
      title: event.title.trim(),
      description: event.description?.trim() || '',
      location: event.location?.trim() || '',
      imageUrl: event.imageUrl || 'https://via.placeholder.com/400x300',
      startDateTime: new Date(event.startDateTime),
      endDateTime: new Date(event.endDateTime),
      price: event.price?.toString() || '0',
      isFree: Boolean(event.isFree),
      url: event.url?.trim() || '',
      category: category._id,
      organizer: mongoUser._id
    };

    console.log('Final event data for MongoDB:', JSON.stringify(cleanEventData, null, 2));

    // Create the event
    const newEvent = await Event.create(cleanEventData);
    console.log('✅ Event saved to database with ID:', newEvent._id);

    // Revalidate path
    revalidatePath(path);
    
    const result = JSON.parse(JSON.stringify(newEvent));
    console.log('✅ Returning event data:', result);
    
    return result;
  } catch (error) {
    console.error('❌ DETAILED ERROR:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      clerkUserId,
      eventTitle: event?.title
    });
    
    throw new Error(`Event creation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
