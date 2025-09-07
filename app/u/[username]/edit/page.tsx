import { redirect } from 'next/navigation';

interface EditProfilePageProps {
  params: { username: string };
}

export default function EditProfilePage({ params }: EditProfilePageProps) {
  redirect(`/${params.username}`);
}
