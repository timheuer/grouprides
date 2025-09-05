"use client";
import { useParams } from 'next/navigation';
import RideForm from '../ride-form';

export default function EditRidePage() {
  const params = useParams();
  const id = params?.id as string;
  return <RideForm mode="edit" rideId={id} />;
}
