import { createContext, useState, useContext } from 'react';

const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  // Default to a Sports URL
  const [activeUrl, setActiveUrl] = useState("https://iptv-org.github.io/iptv/categories/sports.m3u");
  const [categoryName, setCategoryName] = useState("Sports");

  return (
    <CategoryContext.Provider value={{ activeUrl, setActiveUrl, categoryName, setCategoryName }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategory = () => useContext(CategoryContext);