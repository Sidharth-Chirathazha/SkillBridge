import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import Joi from 'joi';
import { joiResolver } from '@hookform/resolvers/joi';
import { Box, Typography, TextField, Button, Tabs, Tab, Paper, Grid, Avatar, IconButton, Chip, Card, CardContent, FormHelperText } from '@mui/material';
import { Upload, PlusCircle, X, FileText } from 'lucide-react';
import UserLayout from '../../components/common/UserLayout';
import { fetchSkills, fetchUser, updateUser } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ACCEPTED_RESUME_TYPES = ['application/pdf', 'application/msword'];

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
      linkedin_url: Joi.string().uri().regex(/linkedin.com/).optional().messages({
        'string.uri': 'Invalid LinkedIn URL',
        'string.pattern.base': 'URL must be from LinkedIn'
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
    }),
    cur_job_role: Joi.string().required().messages({
      'string.empty': 'Current job role is required'
    }),
    educations: Joi.array().items(
      Joi.object({
        university: Joi.string().required(),
        degree: Joi.string().required(),
        year_of_passing: Joi.number().required()
      })
    ),
    work_experiences: Joi.array().items(
      Joi.object({
        company: Joi.string().required(),
        job_role: Joi.string().required(),
        date_of_joining: Joi.date().required(),
        date_of_leaving: Joi.date().required()
      })
    ),
    profile_pic: Joi.any().optional(),
    resume: Joi.any().optional()
  });


const TutorProfile = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [filePreviews, setFilePreviews] = useState({ profile_pic: null, resume: null });
    const { userData, skillsData } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
  
    const { control, handleSubmit, setValue, reset } = useForm({
      resolver: joiResolver(schema),
      defaultValues: {
        user: { ...userData?.user, skills: userData?.user?.skills || [] },
        cur_job_role: userData?.cur_job_role || '',
        educations: userData?.educations || [],
        work_experiences: userData?.work_experiences || []
      }
    });
  
    const { fields: educationFields, append: appendEducation, remove: removeEducation } = useFieldArray({
      control,
      name: 'educations'
    });
  
    const { fields: workFields, append: appendWork, remove: removeWork } = useFieldArray({
      control,
      name: 'work_experiences'
    });
  
    useEffect(() => {
      dispatch(fetchUser());
      dispatch(fetchSkills());
    }, [dispatch]);
  
    useEffect(() => {
      userData && reset({
        user: { ...userData.user, skills: userData.user.skills },
        cur_job_role: userData.cur_job_role,
        educations: userData.educations,
        work_experiences: userData.work_experiences
      });
    }, [userData, reset]);

  const handleFile = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = field === 'profile_pic' ? ACCEPTED_IMAGE_TYPES : ACCEPTED_RESUME_TYPES;
    if (!validTypes.includes(file.type)) {
      toast.error(`Invalid file type for ${field.replace('_', ' ')}`);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File size exceeds 5MB');
      return;
    }

    setValue(field, file);
    setFilePreviews(prev => ({
      ...prev,
      [field]: field === 'profile_pic' ? URL.createObjectURL(file) : file.name
    }));
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };


  const PersonalSection = () => (
    <Paper elevation={1} sx={{ p: 3 }}>
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
            <input type="file" hidden accept="image/*" onChange={(e) => handleFile(e, 'profile_pic')} />
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
            name="cur_job_role"
            control={control}
            render={({ field, fieldState: { error } }) => (
              <TextField
                {...field}
                fullWidth
                label="Current Job Role"
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
  );

  const EducationSection = () => (
    <Paper elevation={1} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Education</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => appendEducation({ university: '', degree: '', year_of_passing: '' })}
        >
          Add Education
        </Button>
      </Box>

      {educationFields.map((field, index) => (
        <Card key={field.id} sx={{ mb: 2, position: 'relative' }}>
          <CardContent>
            <IconButton
              size="small"
              sx={{ position: 'absolute', top: 8, right: 8 }}
              onClick={() => removeEducation(index)}
            >
              <X />
            </IconButton>
            <Controller
              name={`educations.${index}.university`}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="University"
                  error={!!error}
                  helperText={error?.message}
                  sx={{ mb: 2 }}
                />
              )}
            />
            <Controller
              name={`educations.${index}.degree`}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Degree"
                  error={!!error}
                  helperText={error?.message}
                  sx={{ mb: 2 }}
                />
              )}
            />
            <Controller
              name={`educations.${index}.year_of_passing`}
              control={control}
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="number"
                  label="Year of Passing"
                  error={!!error}
                  helperText={error?.message}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              )}
            />
          </CardContent>
        </Card>
      ))}
    </Paper>
  );

  const ExperienceSection = () => (
    <>
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6">Work Experience</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => appendWork({ company: '', job_role: '', date_of_joining: '', date_of_leaving: '' })}
          >
            Add Work Experience
          </Button>
        </Box>

        {workFields.map((field, index) => (
          <Card key={field.id} sx={{ mb: 2, position: 'relative' }}>
            <CardContent>
              <IconButton
                size="small"
                sx={{ position: 'absolute', top: 8, right: 8 }}
                onClick={() => removeWork(index)}
              >
                <X />
              </IconButton>
              <Controller
                name={`work_experiences.${index}.company`}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Company"
                    error={!!error}
                    helperText={error?.message}
                    sx={{ mb: 2 }}
                  />
                )}
              />
              <Controller
                name={`work_experiences.${index}.job_role`}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Job Role"
                    error={!!error}
                    helperText={error?.message}
                    sx={{ mb: 2 }}
                  />
                )}
              />
              <Controller
                name={`work_experiences.${index}.date_of_joining`}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Date of Joining"
                    InputLabelProps={{ shrink: true }}
                    error={!!error}
                    helperText={error?.message}
                    sx={{ mb: 2 }}
                  />
                )}
              />
              <Controller
                name={`work_experiences.${index}.date_of_leaving`}
                control={control}
                render={({ field, fieldState: { error } }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="date"
                    label="Date of Leaving"
                    InputLabelProps={{ shrink: true }}
                    error={!!error}
                    helperText={error?.message}
                  />
                )}
              />
            </CardContent>
          </Card>
        ))}
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
                    sx={{ '&:hover': { cursor: 'pointer' } }}
                  />
                ))}
              </Box>
              {error && (
                <FormHelperText error>{error.message}</FormHelperText>
              )}
            </Box>
          )}
        />
      </Paper>

      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>Upload Resume</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ position: 'relative' }}>
            <Box
              sx={{
                width: 256,
                height: 128,
                borderRadius: 2,
                bgcolor: 'background.default',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed',
                borderColor: 'divider',
                '&:hover': { borderColor: 'primary.main' }
              }}
            >
              {filePreviews.resume || userData?.resume_url ? (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                  <FileText sx={{ width: 32, height: 32, color: 'primary.main', mb: 1 }} />
                  {filePreviews.resume || (
                    <Typography
                      component="a"
                      href={userData.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ color: 'primary.main', textDecoration: 'underline' }}
                    >
                      View Resume
                    </Typography>
                  )}
                </Box>
              ) : (
                <>
                  <FileText sx={{ width: 32, height: 32, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Upload your resume
                  </Typography>
                </>
              )}
            </Box>
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
              <input
                type="file"
                hidden
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFile(e, 'resume')}
              />
              <PlusCircle />
            </IconButton>
          </Box>
        </Box>
      </Paper>
    </>
  );

  const onSubmit = async (data) => {
    const formData = new FormData();
    const { profile_pic, resume, ...jsonData } = data;
    
    formData.append('json_data', JSON.stringify({
      ...jsonData,
      user: { ...jsonData.user, skills: jsonData.user.skills.map(Number) }
    }));
    
    if (profile_pic instanceof File) {
      formData.append('profile_pic', profile_pic);
    }
    if (resume instanceof File) {
      formData.append('resume', resume);
    }

    try {
      await dispatch(updateUser(formData));
      dispatch(fetchUser());
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  return (
    <UserLayout>
      <Box sx={{ maxWidth: 'lg', mx: 'auto', py: 4, px: 2 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
            Complete Your Profile
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1 }}>
            Please provide your details to get started as a tutor
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Personal Information" value={0} />
            <Tab label="Education" value={1} />
            <Tab label="Experience & Skills" value={2} />
          </Tabs>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          {activeTab === 0 && <PersonalSection />}
          {activeTab === 1 && <EducationSection />}
          {activeTab === 2 && <ExperienceSection />}

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

export default TutorProfile;