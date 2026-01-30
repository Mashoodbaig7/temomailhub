import React from 'react';
import './Avatar.css';

/**
 * Avatar Component
 * Displays user profile image or generates an avatar from the first letter of username
 * 
 * @param {string} imageUrl - Optional profile image URL
 * @param {string} name - Username to generate avatar if no image
 * @param {string} size - Size variant ('small', 'medium', 'large')
 * @param {string} className - Additional CSS classes
 */
const Avatar = ({ imageUrl, name = 'User', size = 'medium', className = '' }) => {
  const getInitial = (name) => {
    if (!name || name.trim() === '') return 'U';
    return name.trim().charAt(0).toUpperCase();
  };

  const getAvatarColor = (name) => {
    // Generate consistent color based on username
    const colors = [
      '#16423C', // Dark teal
      '#6A9C89', // Light teal
      '#C4DAD2', // Very light teal
      '#E9EFEC', // Almost white teal
      '#2d6a60', // Medium teal
      '#1a5046', // Darker teal
      '#4a7c71', // Mid teal
      '#8bb3a7', // Soft teal
    ];
    
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const sizeClasses = {
    small: 'avatar-small',
    medium: 'avatar-medium',
    large: 'avatar-large',
  };

  if (imageUrl && imageUrl.trim() !== '') {
    // Display uploaded profile image
    return (
      <div className={`avatar-container ${sizeClasses[size]} ${className}`}>
        <img 
          src={imageUrl} 
          alt={`${name}'s profile`} 
          className="avatar-image"
          onError={(e) => {
            // Fallback to generated avatar if image fails to load
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div 
          className="avatar-letter" 
          style={{ backgroundColor: getAvatarColor(name), display: 'none' }}
        >
          {getInitial(name)}
        </div>
      </div>
    );
  }

  // Display generated avatar with first letter
  return (
    <div className={`avatar-container ${sizeClasses[size]} ${className}`}>
      <div 
        className="avatar-letter" 
        style={{ backgroundColor: getAvatarColor(name) }}
      >
        {getInitial(name)}
      </div>
    </div>
  );
};

export default Avatar;
