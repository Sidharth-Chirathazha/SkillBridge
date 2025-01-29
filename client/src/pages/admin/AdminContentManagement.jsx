import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2, Loader } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSkills } from '../../redux/slices/authSlice';
import { addSkill, deleteSkill } from '../../redux/slices/adminSlice';
import { fetchCategories,addCategory,updateCategory, deleteCategory } from '../../redux/slices/courseSlice';
import toast from 'react-hot-toast';

const AdminContentManagement = () => {
  
    const [newCategory, setNewCategory] = useState('');
    const [newSkill, setNewSkill] = useState('');
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [isAddingSkill, setIsAddingSkill] = useState(false);

    const dispatch = useDispatch();
    const { skillsData, isLoading, isSuccess } = useSelector((state)=>state.auth);
    const { categoriesData, isCategoryLoading} = useSelector((state)=>state.course);

    useEffect(()=>{
      dispatch(fetchSkills());
      dispatch(fetchCategories());
    },[dispatch])
  
  
    const handleAddCategory = async (e) => {
      e.preventDefault();
      if (!newCategory.trim()) return;
  
      setIsAddingCategory(true);
      try {
         await dispatch(addCategory({name:newCategory})).unwrap();
         setNewCategory("");
         dispatch(fetchCategories());
         toast.success("Category added successfully");
        }catch(error){
          toast.error("Error While Adding Category.");
          console.error("Error adding category:", error);
        }finally {
          setIsAddingCategory(false);
        }
    };

    const handleToggleActiveStatus = async (categoryId, isActive)=>{
      try{
        await dispatch(
          updateCategory({id:categoryId, updateData:{is_active:!isActive}})
        ).unwrap()
        dispatch(fetchCategories());
        toast.success("Category status updated!");
      }catch(error){
        toast.error("Error while updating category status.");
        console.error("Error updating category:", error);
      }
    }
    
    // Handle deleting a category
    const handleDeleteCategory = async (categoryId) => {
      try {
        await dispatch(deleteCategory(categoryId)).unwrap();
        dispatch(fetchCategories());
        toast.success("Category deleted successfully!");
      } catch (error) {
        toast.error("Error while deleting category.");
        console.error("Error deleting category:", error);
      }
    };
  
    const handleAddSkill = async (e) => {
      e.preventDefault();
      if (!newSkill.trim()) return;
  
      setIsAddingSkill(true);
      try {
        await dispatch(addSkill({ skill_name: newSkill })).unwrap();
        setNewSkill('');
        dispatch(fetchSkills());
        toast.success("Skill added successfully")
      } catch (error) {
        toast.error("Error while adding skill")
        console.error('Error adding skill:', error);
      } finally {
        setIsAddingSkill(false);
      }
    };

    // Handle deleting a skill
    const handleDeleteSkill = async (skillId) => {
      try {
        await dispatch(deleteSkill(skillId)).unwrap();
        dispatch(fetchSkills());
        toast.success("Skill deleted successfully!");
      } catch (error) {
        toast.error("Error while deleting skill.");
        console.error("Error deleting skill:", error);
      }
    };

    if (isLoading ||  !skillsData || isCategoryLoading) {
        return (
          <div className="flex justify-center items-center h-screen">
            <Loader className="animate-spin h-10 w-10 text-primary" />
          </div>
        );
      }
  
    return (
      <AdminLayout>
        <div className="max-w-7xl mx-auto space-y-8">
          <h1 className="text-2xl font-bold text-text-500 mb-8">Content Management</h1>
  
          {/* Categories Section */}
          <div className="bg-background-50 p-6 rounded-lg shadow-sm border border-background-200">
            <h2 className="text-xl font-semibold text-text-500 mb-6">Categories</h2>
  
            <form onSubmit={handleAddCategory} className="mb-6">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter category name"
                  className="flex-1 px-4 py-2 rounded-lg border border-background-200 focus:outline-none focus:border-text-200 focus:ring-2 focus:ring-text-50 transition-all duration-200"
                />
                <button
                  type="submit"
                  disabled={isAddingCategory}
                  className="px-6 py-2 bg-text-50 text-text-700 rounded-lg hover:bg-text-100 font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingCategory ? (
                    <Loader className="h-5 w-5 animate-spin" />
                  ) : (
                    <Plus className="h-5 w-5" />
                  )}
                  Add Category
                </button>
              </div>
            </form>
  
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoriesData.map((category) => (
                <div
                  key={category.id}
                  className={`p-4 rounded-lg border flex justify-between items-center ${
                    category.is_active ? 'bg-text-50' : 'bg-secondary-50'
                  }`}
                >
                  <span className="font-medium text-text-500">{category.name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleActiveStatus(category.id, category.is_active)}
                      className={`px-4 py-1 rounded-full font-semibold text-sm transition-colors ${
                        category.is_active
                          ? 'bg-text-50 text-text-700 hover:bg-text-100'
                          : 'bg-secondary-50 text-secondary-700 hover:bg-secondary-100'
                      }`}
                    >
                      {category.is_active ? 'Active' : 'Inactive'}
                    </button>
                    <button
                     onClick={() => handleDeleteCategory(category.id)}
                      className="p-1.5 text-secondary-500 hover:bg-secondary-50 rounded-full transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
  
          {/* Skills Section */}
          <div className="bg-background-50 p-6 rounded-lg shadow-sm border border-background-200">
            <h2 className="text-xl font-semibold text-text-500 mb-6">Skills</h2>
  
            <form onSubmit={handleAddSkill} className="mb-6">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Enter skill name"
                  className="flex-1 px-4 py-2 rounded-lg border border-background-200 focus:outline-none focus:border-text-200 focus:ring-2 focus:ring-text-50 transition-all duration-200"
                />
                <button
                  type="submit"
                  disabled={isAddingSkill}
                  className="px-6 py-2 bg-text-50 text-text-700 rounded-lg hover:bg-text-100 font-semibold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingSkill ? (
                    <Loader className="h-5 w-5 animate-spin" />
                  ) : (
                    <Plus className="h-5 w-5" />
                  )}
                  Add Skill
                </button>
              </div>
            </form>
  
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {skillsData.map((skill) => (
                <div
                  key={skill.id}
                  className="p-4 bg-background-100 rounded-lg border border-background-200 flex justify-between items-center"
                >
                  <span className="font-medium text-text-500">{skill.skill_name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeleteSkill(skill.id)}
                      className="p-1.5 text-secondary-500 hover:bg-secondary-50 rounded-full transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  };
  
  export default AdminContentManagement;
  