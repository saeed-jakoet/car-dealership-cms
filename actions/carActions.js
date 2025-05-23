'use server';
import dbConnect from '@/lib/dbConnect';
import Car from '@/models/Car';
import { revalidatePath } from 'next/cache';

export async function createCar(formData) {
  await dbConnect();
  const newCar = new Car(Object.fromEntries(formData));
  await newCar.save();
  revalidatePath('/admin');
  return { success: true };
}

export async function updateCar(id, formData) {
  await dbConnect();
  await Car.findByIdAndUpdate(id, Object.fromEntries(formData));
  revalidatePath('/admin');
  return { success: true };
}

export async function deleteCar(id) {
  await dbConnect();
  await Car.findByIdAndDelete(id);
  revalidatePath('/admin');
  return { success: true };
}

export async function getCars() {
  await dbConnect();
  return JSON.parse(JSON.stringify(await Car.find().sort({ createdAt: -1 })));
}