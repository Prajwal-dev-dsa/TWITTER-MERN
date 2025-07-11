import { useMutation } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

function useUpdateUserProfile() {
    const queryClient = useQueryClient(); //to invalidate the queries to refetch the data

    //below is the mutation to update the user profile
    const { mutateAsync: updateProfile, isPending: isUpdatingProfile } =
    useMutation({
      mutationFn: async (formData) => {
        try{
          const res = await fetch(`/api/users/update`, { //link to the backend route
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(formData),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || "Failed to update profile");
          return data;
        } catch (error) {
          console.log(error);
          throw new Error(error.message);
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["posts"] }); //to invalidate the posts query to refetch the data
        queryClient.invalidateQueries({ queryKey: ["userProfile"] }); //to invalidate the user profile query to refetch the data
        queryClient.invalidateQueries({ queryKey: ["authUser"] }); //to invalidate the auth user query to refetch the data
        toast.success("Profile updated successfully");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

    return { updateProfile, isUpdatingProfile };
}

export default useUpdateUserProfile
