import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  TextField, 
  Button, 
  Tabs, 
  Tab, 
  Box, 
  MenuItem, 
  InputLabel, 
  Select, 
  FormControl,
  Typography,
  Paper,
  Divider
} from '@mui/material';
import { Upload } from 'lucide-react';
import UserLayout from '../../components/common/UserLayout';

const courseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  thumbnail: z.any().refine(file => file && file.size <= 2 * 1024 * 1024, {
    message: 'Thumbnail must be less than 2MB',
  }),
  skill_level: z.enum(['Beginner', 'Intermediate', 'Advanced'], {
    errorMap: () => ({ message: 'Select a valid skill level' }),
  }),
  price: z.number().min(1, 'Price must be at least 1'),
  category: z.string().min(1, 'Category is required'),
  modules: z.array(
    z.object({
      title: z.string().min(1, 'Module title is required'),
      description: z.string().min(1, 'Module description is required'),
      video: z.any().refine(file => file && file.size <= 10 * 1024 * 1024, {
        message: 'Video must be less than 10MB',
      }),
      duration: z.string().min(1, 'Duration is required'),
      tasks: z.any().refine(file => file && file.size <= 5 * 1024 * 1024, {
        message: 'Task document must be less than 5MB',
      }),
    })
  ),
});

const CourseCreation = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const { register, control, handleSubmit, formState: { errors }, setValue } = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      description: '',
      thumbnail: null,
      skill_level: '',
      price: '',
      category: '',
      modules: [{ title: '', description: '', video: null, duration: '', tasks: null }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'modules',
  });

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const onSubmit = data => {
    console.log(data);
  };

  return (
    <UserLayout>
      <Box sx={{ maxWidth: '800px', margin: 'auto', p: 3 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            mb: 4, 
            color: 'primary.heading',
            fontWeight: 600,
            textAlign: 'center'
          }}
        >
          Create New Course
        </Typography>

        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Tabs 
            value={tabIndex} 
            onChange={handleTabChange} 
            centered
            sx={{
              mb: 3,
              '& .MuiTab-root': {
                fontWeight: 500,
                fontSize: '1rem',
              },
            }}
          >
            <Tab label="Course Details" />
            <Tab label="Modules" />
          </Tabs>
          <Divider sx={{ mb: 4 }} />

          {tabIndex === 0 && (
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <TextField
                label="Title"
                fullWidth
                margin="normal"
                {...register('title')}
                error={!!errors.title}
                helperText={errors.title?.message}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'background.paper',
                  },
                }}
              />

              <TextField
                label="Description"
                fullWidth
                margin="normal"
                multiline
                rows={4}
                {...register('description')}
                error={!!errors.description}
                helperText={errors.description?.message}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'background.paper',
                  },
                }}
              />

              <FormControl 
                fullWidth 
                margin="normal"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'background.paper',
                  },
                }}
              >
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  label="Category"
                  {...register('category')}
                  error={!!errors.category}
                >
                  <MenuItem value="">Select a Category</MenuItem>
                  <MenuItem value="1">Category 1</MenuItem>
                  <MenuItem value="2">Category 2</MenuItem>
                </Select>
              </FormControl>

              <FormControl 
                fullWidth 
                margin="normal"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'background.paper',
                  },
                }}
              >
                <InputLabel id="skill-level-label">Skill Level</InputLabel>
                <Select
                  labelId="skill-level-label"
                  label="Skill Level"
                  {...register('skill_level')}
                  error={!!errors.skill_level}
                >
                  <MenuItem value="">Select Skill Level</MenuItem>
                  <MenuItem value="Beginner">Beginner</MenuItem>
                  <MenuItem value="Intermediate">Intermediate</MenuItem>
                  <MenuItem value="Advanced">Advanced</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Price"
                fullWidth
                margin="normal"
                type="number"
                {...register('price', { valueAsNumber: true })}
                error={!!errors.price}
                helperText={errors.price?.message}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'background.paper',
                  },
                }}
              />

              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<Upload />}
                sx={{ 
                  mt: 2,
                  height: '56px',
                  borderStyle: 'dashed'
                }}
              >
                Upload Thumbnail
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  {...register('thumbnail')}
                  onChange={(e) => setValue('thumbnail', e.target.files[0])}
                />
              </Button>
              {errors.thumbnail && (
                <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                  {errors.thumbnail.message}
                </Typography>
              )}

              <Button
                variant="contained"
                color="primary"
                fullWidth
                type="submit"
                sx={{ 
                  mt: 4,
                  py: 1.5,
                  fontSize: '1rem'
                }}
              >
                Next
              </Button>
            </Box>
          )}

          {tabIndex === 1 && (
            <Box>
              {fields.map((field, index) => (
                <Paper 
                  key={field.id} 
                  sx={{ 
                    mb: 4, 
                    p: 3, 
                    border: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'background.default'
                  }}
                >
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Module {index + 1}
                  </Typography>

                  <TextField
                    label="Module Title"
                    fullWidth
                    margin="normal"
                    {...register(`modules.${index}.title`)}
                    error={!!errors.modules?.[index]?.title}
                    helperText={errors.modules?.[index]?.title?.message}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.paper',
                      },
                    }}
                  />

                  <TextField
                    label="Module Description"
                    fullWidth
                    margin="normal"
                    multiline
                    rows={2}
                    {...register(`modules.${index}.description`)}
                    error={!!errors.modules?.[index]?.description}
                    helperText={errors.modules?.[index]?.description?.message}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.paper',
                      },
                    }}
                  />

                  <TextField
                    label="Duration"
                    fullWidth
                    margin="normal"
                    {...register(`modules.${index}.duration`)}
                    error={!!errors.modules?.[index]?.duration}
                    helperText={errors.modules?.[index]?.duration?.message}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'background.paper',
                      },
                    }}
                  />

                  <Box sx={{ mt: 3 }}>
                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      startIcon={<Upload />}
                      sx={{ 
                        mb: 2,
                        height: '56px',
                        borderStyle: 'dashed'
                      }}
                    >
                      Upload Video
                      <input
                        type="file"
                        accept="video/*"
                        hidden
                        {...register(`modules.${index}.video`)}
                        onChange={(e) => setValue(`modules.${index}.video`, e.target.files[0])}
                      />
                    </Button>
                    {errors.modules?.[index]?.video && (
                      <Typography color="error" variant="caption" sx={{ display: 'block', mb: 2 }}>
                        {errors.modules[index].video.message}
                      </Typography>
                    )}

                    <Button
                      variant="outlined"
                      component="label"
                      fullWidth
                      startIcon={<Upload />}
                      sx={{ 
                        height: '56px',
                        borderStyle: 'dashed'
                      }}
                    >
                      Upload Tasks Document
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        hidden
                        {...register(`modules.${index}.tasks`)}
                        onChange={(e) => setValue(`modules.${index}.tasks`, e.target.files[0])}
                      />
                    </Button>
                    {errors.modules?.[index]?.tasks && (
                      <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>
                        {errors.modules[index].tasks.message}
                      </Typography>
                    )}
                  </Box>

                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => remove(index)}
                    sx={{ mt: 3 }}
                  >
                    Remove Module
                  </Button>
                </Paper>
              ))}

              <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                <Button
                  variant="outlined"
                  onClick={() => append({ title: '', description: '', video: null, duration: '', tasks: null })}
                  sx={{ flex: 1 }}
                >
                  Add Module
                </Button>
              </Box>

              <Button
                variant="contained"
                color="primary"
                fullWidth
                type="submit"
                onClick={handleSubmit(onSubmit)}
                sx={{ 
                  py: 1.5,
                  fontSize: '1rem'
                }}
              >
                Submit Course
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </UserLayout>
  );
};

export default CourseCreation;