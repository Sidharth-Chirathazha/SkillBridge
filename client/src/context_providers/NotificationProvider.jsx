import { createContext, useContext, useState } from "react";

const NotificationContext = createContext();

export const NotificationProvider = ({children}) =>{
    const [notificationCount, setNotificationCount] = useState(0);

    return (
        <NotificationContext.Provider value={{ notificationCount, setNotificationCount }}>
            {children}
        </NotificationContext.Provider>
    );
}

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
      throw new Error("useNotification must be used within a NotificationProvider");
    }
    return context;
  };