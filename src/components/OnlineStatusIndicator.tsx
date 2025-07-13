import { useOnlineStatus } from "../hooks/useOnlineStatus";
import "./OnlineStatusIndicator.css";

export function OnlineStatusIndicator() {
  const isOnline = useOnlineStatus();

  return (
    <div className='online-status-indicator'>
      {isOnline ? <span className='online'>Online</span> : <span className='offline'>Offline</span>}
    </div>
  );
}
