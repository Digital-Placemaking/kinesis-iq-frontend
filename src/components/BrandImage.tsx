
import React from 'react';

const BrandImage: React.FC = () => {
  return (
    <div className="text-center">
      <img 
        src="/lovable-uploads/anthony-perruzza-logo.jpg" 
        alt="Anthony Perruzza - City Councillor, Humber River - Black Creek"
        className="mx-auto h-24 object-contain"
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
};

export default BrandImage;
