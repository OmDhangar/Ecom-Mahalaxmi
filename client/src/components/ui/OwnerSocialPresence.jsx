import React from 'react';
import { Button } from "@/components/ui/button";
import { Instagram, Facebook, Twitter, LinkedIn } from "lucide-react";

const OwnerSocialPresence = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center">
      <h2 className="text-xl font-bold mb-2">Follow Our Journey</h2>
      <p className="text-gray-600 mb-4">Join our community of 240k followers!</p>
      <div className="flex justify-center space-x-4 mb-4">
        <Button variant="outline" className="flex items-center">
          <Instagram className="mr-2" />
          Instagram
        </Button>
        <Button variant="outline" className="flex items-center">
          <Facebook className="mr-2" />
          Facebook
        </Button>
        <Button variant="outline" className="flex items-center">
          <Twitter className="mr-2" />
          Twitter
        </Button>
        <Button variant="outline" className="flex items-center">
          <LinkedIn className="mr-2" />
          LinkedIn
        </Button>
      </div>
      <p className="text-sm text-gray-500">Stay updated with our latest products and exclusive offers!</p>
    </div>
  );
};

export default OwnerSocialPresence;