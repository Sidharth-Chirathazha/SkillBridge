import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import Joi from 'joi';
import { joiResolver } from '@hookform/resolvers/joi';
import { Box, Typography, TextField, Button, Paper, Grid, Avatar, IconButton, Chip, FormHelperText } from '@mui/material';
import { Upload, PlusCircle, Linkedin } from 'lucide-react';
import UserLayout from '../../components/common/UserLayout';
import { fetchUser, updateUser, fetchSkills } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';


const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];


const schema = Joi.object({
  user: Joi.object({
    first_name: Joi.string().min(2).required().messages({
      'string.min': 'First name must be at least 2 characters',
      'string.empty': 'First name is required'
    }),
    last_name: Joi.string().min(1).required().messages({
      'string.min': 'Last name is required',
      'string.empty': 'Last name is required'
    }),
    phone: Joi.string().regex(/^[0-9]{10}$/).required().messages({
      'string.pattern.base': 'Invalid phone number'
    }),
    linkedin_url: Joi.string().uri().optional().messages({
      'string.uri': 'Invalid LinkedIn URL'
    }),
    bio: Joi.string().min(50).required().messages({
      'string.min': 'Bio must be at least 50 characters',
      'string.empty': 'Bio is required'
    }),
    country: Joi.string().required().messages({
      'string.empty': 'Country is required'
    }),
    city: Joi.string().required().messages({
      'string.empty': 'City is required'
    }),
    skills: Joi.array().items(Joi.number()).min(1).required().messages({
      'array.min': 'Select at least one skill'
    })
  }).unknown(true),

  profile_pic: Joi.any()
    .optional()
    .meta({ type: 'file' })
    .custom((value, helpers) => {
      if (value && value.size > MAX_FILE_SIZE) {
        return helpers.error('file.size');
      }
      if (value && !ACCEPTED_IMAGE_TYPES.includes(value.type)) {
        return helpers.error('file.type');
      }
      return value;
    })
    .messages({
      'file.size': 'File size exceeds 5MB',
      'file.type': 'Invalid image format (allowed: jpg, png, webp)'
    })
});

const StudentProfile = () => {
  const dispatch = useDispatch();
  const { userData, skillsData, isUpdateError } = useSelector((state) => state.auth);
  const [filePreviews, setFilePreviews] = useState({ profile_pic: null });

  const { control, handleSubmit, setValue, reset } = useForm({
    resolver: joiResolver(schema),
    defaultValues: {
      user: { 
        ...userData?.user, 
        skills: userData?.user?.skills || [] 
      },
      profile_pic: null
    }
  });

  useEffect(() => {
    dispatch(fetchUser());
    dispatch(fetchSkills());
  }, [dispatch]);

  useEffect(() => {
    if (userData) {
      reset({
        user: {
          first_name: userData.user?.first_name || '',
          last_name: userData.user?.last_name || '',
          phone: userData.user?.phone || '',
          linkedin_url: userData.user?.linkedin_url || '',
          bio: userData.user?.bio || '',
          country: userData.user?.country || '',
          city: userData.user?.city || '',
          skills: userData.user?.skills || []
        },
        profile_pic: null
      });
      setFilePreviews({
        profile_pic: userData?.user?.profile_pic_url || null
      });
    }
  }, [userData, reset]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setValue('profile_pic', file, {shouldValidate: true});
    setFilePreviews(prev => ({
      ...prev,
      profile_pic: URL.createObjectURL(file)
    }));
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    const { profile_pic, ...jsonData } = data;

    formData.append('json_data', JSON.stringify({
      ...jsonData,
      user: { 
        ...jsonData.user, 
        skills: jsonData.user.skills.map(Number) 
      }
    }));

    if (profile_pic instanceof File) {
      formData.append('profile_pic', profile_pic);
    }

    try {
      await dispatch(updateUser(formData));
      if(isUpdateError){
        toast.error("Failed to update profile");
      }
      else{
        dispatch(fetchUser());
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  return (
    <UserLayout>
      <Box sx={{ maxWidth: 'lg', mx: 'auto', py: 4, px: 2 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Complete Your Profile
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, color: 'text.secondary' }}>
            Please provide your details to get started as a Student
          </Typography>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={filePreviews.profile_pic || userData?.user?.profile_pic_url}
                  sx={{ width: 120, height: 120, border: 3, borderColor: 'background.paper' }}
                >
                  <Upload />
                </Avatar>
                <IconButton
                  component="label"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                >
                  <input type="file" hidden accept="image/*" onChange={handleFile} />
                  <PlusCircle />
                </IconButton>
              </Box>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={6}>
                <Controller
                  name="user.first_name"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="First Name"
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="user.last_name"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Last Name"
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="user.phone"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Phone"
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="user.country"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Country"
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <Controller
                  name="user.city"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="City"
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="user.bio"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={4}
                      label="Bio"
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>Skills</Typography>
            <Controller
              name="user.skills"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {skillsData.map(skill => (
                      <Chip
                        key={skill.id}
                        label={skill.skill_name}
                        onClick={() => {
                          const newValue = field.value.includes(skill.id)
                            ? field.value.filter(id => id !== skill.id)
                            : [...field.value, skill.id];
                          field.onChange(newValue);
                        }}
                        color={field.value.includes(skill.id) ? 'primary' : 'default'}
                        sx={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Box>
                  {error && <FormHelperText error>{error.message}</FormHelperText>}
                </Box>
              )}
            />
          </Paper>

          <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>Social Media Profiles</Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={1}>
                <Linkedin color="#0077b5" />
              </Grid>
              <Grid item xs={11}>
                <Controller
                  name="user.linkedin_url"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="LinkedIn Profile URL"
                      error={!!error}
                      helperText={error?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Paper>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{ px: 4, py: 1.5, fontWeight: 600 }}
            >
              Save Profile
            </Button>
          </Box>
        </form>
      </Box>
    </UserLayout>
  );
};

export default StudentProfile;