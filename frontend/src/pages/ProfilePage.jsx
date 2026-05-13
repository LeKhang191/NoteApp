import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, User } from 'lucide-react';

const ProfilePage = () => {
  const navigate = useNavigate();

  // Lấy user từ localStorage
  const savedUser = JSON.parse(localStorage.getItem('user') || '{}');

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(savedUser.displayName || 'User');
  const [email] = useState(savedUser.email || '');
  const [avatar, setAvatar] = useState(savedUser.avatar || null);
  const [success, setSuccess] = useState('');

  const fileRef = useRef();

  // Xử lý chọn ảnh avatar
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result); // lưu base64
    };
    reader.readAsDataURL(file);
  };

  // Lưu thông tin
  const handleSave = () => {
    const updatedUser = { ...savedUser, displayName, avatar };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setIsEditing(false);
    setSuccess('Cập nhật thông tin thành công!');
    setTimeout(() => setSuccess(''), 3000);
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] font-sans text-[#37352f]">
      {/* Header */}
      <div className="bg-white border-b border-[#e9e9e8] px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-1.5 hover:bg-[#f7f7f5] rounded-md transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-semibold">Profile</h1>
      </div>

      <div className="max-w-lg mx-auto px-6 py-10">
        {/* Thông báo thành công */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-md">
            {success}
          </div>
        )}

        <div className="bg-white rounded-xl border border-[#e9e9e8] overflow-hidden">
          {/* Avatar section */}
          <div className="flex flex-col items-center py-8 border-b border-[#e9e9e8] bg-[#fafafa]">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-[#37352f] flex items-center justify-center overflow-hidden border-4 border-white shadow-md">
                {avatar
                  ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                  : <User size={36} className="text-white" />
                }
              </div>
              {/* Nút đổi ảnh - chỉ hiện khi đang edit */}
              {isEditing && (
                <button
                  onClick={() => fileRef.current.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-[#37352f] text-white rounded-full flex items-center justify-center shadow-md hover:bg-black transition-colors"
                >
                  <Camera size={14} />
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <p className="mt-3 font-semibold text-lg">{displayName}</p>
            <p className="text-sm text-[#9b9a97]">{email}</p>
          </div>

          {/* Thông tin */}
          <div className="p-6 space-y-5">
            {/* Display Name */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#9b9a97]">
                Display Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 bg-[#f7f7f5] border border-[#e9e9e8] rounded-md focus:outline-none focus:ring-1 focus:ring-[#37352f] text-sm"
                />
              ) : (
                <p className="mt-1 text-sm py-2 px-3 bg-[#f7f7f5] rounded-md">{displayName}</p>
              )}
            </div>

            {/* Email - không cho sửa */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#9b9a97]">
                Email
              </label>
              <p className="mt-1 text-sm py-2 px-3 bg-[#f7f7f5] rounded-md text-[#9b9a97]">
                {email}
              </p>
            </div>

            {/* Account Status */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#9b9a97]">
                Account Status
              </label>
              <div className="mt-1 flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${
                  savedUser.isActivated
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${savedUser.isActivated ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                  {savedUser.isActivated ? 'Verified' : 'Unverified – Check your email'}
                </span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="px-6 pb-6 flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-[#37352f] text-white py-2 rounded-md text-sm font-medium hover:bg-black transition-colors"
                >
                  Save changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm text-[#9b9a97] hover:text-[#37352f] transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 border border-[#e9e9e8] py-2 rounded-md text-sm font-medium hover:bg-[#f7f7f5] transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Nút đổi mật khẩu */}
        <button
          onClick={() => navigate('/change-password')}
          className="mt-4 w-full border border-[#e9e9e8] bg-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#f7f7f5] transition-colors"
        >
          Change Password
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;