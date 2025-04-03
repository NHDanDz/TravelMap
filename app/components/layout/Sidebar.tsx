// app/components/layout/Sidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
  subitems?: { href: string; label: string }[];
}

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  
  // Reset active group when sidebar opens or closes
  useEffect(() => {
    if (!isOpen) {
      setActiveGroup(null);
    }
  }, [isOpen]);

  const navItems: NavItem[] = [
    {
      href: '/dashboard',
      label: 'Tổng quan',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      href: '/dashboard/landslides',
      label: 'Sạt lở đất',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
        </svg>
      ),
      badge: 8,
      subitems: [
        { href: '/dashboard/landslides?tab=all', label: 'Tất cả điểm sạt lở' },
        { href: '/dashboard/landslides?tab=monitoring', label: 'Theo dõi liên tục' },
        { href: '/dashboard/landslides?tab=notifications', label: 'Thông báo & Cảnh báo' }
      ]
    },
    {
      href: '/dashboard/Map',
      label: 'Bản đồ',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      )
    },
    {
      href: '/dashboard/statistics',
      label: 'Thống kê',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      href: '/dashboard/notifications',
      label: 'Thông báo',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
      badge: 3
    }
  ];

  // Group items for display
  const mainNavItems = navItems.slice(0, 4);
  const otherNavItems = navItems.slice(4);

  // Check if path is active (exact match or starts with path for submenus)
  const isActive = (path: string) => {
    if (pathname === path) return true;
    if (path !== '/dashboard' && pathname && pathname.startsWith(path)) return true;
    return false;
  };

  // Toggle a submenu group
  const toggleGroup = (href: string) => {
    setActiveGroup(activeGroup === href ? null : href);
  };

  return (
    <aside 
      className={`bg-white border-r border-gray-200 shadow-sm transition-all duration-300 z-20 ${
        isOpen ? (collapsed ? 'w-16' : 'w-56') : 'w-0 translate-x-0'
      } h-[calc(100vh-4rem)] overflow-hidden`}
    >
      <div className="flex flex-col h-full">
        {/* Sidebar header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {!collapsed && isOpen && (
            <h2 className="text-lg font-semibold text-gray-800">
              <span className="text-blue-600">Land</span>Monitor
            </h2>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)} 
            className={`p-2 rounded-md text-gray-500 hover:bg-gray-100 ${collapsed && 'mx-auto'}`}
          >
            {collapsed ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Main navigation */}
        <div className="flex-1 py-6 overflow-y-auto scrollbar-thin">
          {/* User info panel */}
          {!collapsed && isOpen && (
            <div className="px-4 mb-6">
              <div className="p-3 bg-blue-50 rounded-lg flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                  AU
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">Admin User</div>
                  <div className="text-xs text-gray-500">Quản trị viên</div>
                </div>
              </div>
            </div>
          )}
        
          {/* Dashboard section */}
          <div className="px-3 mb-6">
            <div className={`${!collapsed && 'mb-2'}`}>
              {!collapsed && isOpen && (
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Dashboard
                </h3>
              )}
              <ul className="mt-2 space-y-1">
                {mainNavItems.map((item) => (
                  <li key={item.href}>
                    {item.subitems ? (
                      <div className="space-y-1">
                        <button
                          onClick={() => toggleGroup(item.href)}
                          className={`flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                            isActive(item.href)
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <span className="inline-block mr-3">{item.icon}</span>
                          {!collapsed && isOpen && (
                            <>
                              <span className="flex-1">{item.label}</span>
                              {item.badge && (
                                <span className="ml-3 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  {item.badge}
                                </span>
                              )}
                              <svg 
                                className={`ml-2 w-4 h-4 transition-transform ${
                                  activeGroup === item.href ? 'transform rotate-180' : ''
                                }`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24" 
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </>
                          )}
                          {collapsed && item.badge && (
                            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500"></span>
                          )}
                        </button>
                        
                        {/* Subitems */}
                        {!collapsed && isOpen && activeGroup === item.href && item.subitems && (
                          <ul className="pl-10 pr-2 space-y-1">
                            {item.subitems.map((subitem) => (
                              <li key={subitem.href}>
                                <Link
                                  href={subitem.href}
                                  className={`block px-3 py-2 text-sm rounded-md ${
                                    pathname === subitem.href
                                      ? 'bg-blue-50 text-blue-700 font-medium'
                                      : 'text-gray-600 hover:bg-gray-100'
                                  }`}
                                >
                                  {subitem.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                          isActive(item.href)
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span className={`inline-block ${!collapsed && 'mr-3'}`}>{item.icon}</span>
                        {!collapsed && isOpen && (
                          <>
                            <span>{item.label}</span>
                            {item.badge && (
                              <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                        {collapsed && item.badge && (
                          <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500"></span>
                        )}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Settings section */}
            {!collapsed && isOpen && (
              <div>
                <h3 className="px-3 mt-8 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Quản trị
                </h3>
                <ul className="mt-2 space-y-1">
                  {otherNavItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                          isActive(item.href)
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span className="inline-block mr-3">{item.icon}</span>
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Collapsed mode for settings */}
            {collapsed && isOpen && (
              <ul className="mt-8 space-y-1">
                {otherNavItems.map((item) => (
                  <li key={item.href} className="relative">
                    <Link
                      href={item.href}
                      className={`flex justify-center items-center p-3 text-sm rounded-md transition-colors duration-200 ${
                        isActive(item.href)
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span>{item.icon}</span>
                      {item.badge && (
                        <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500"></span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {/* Sidebar footer */}
        {!collapsed && isOpen && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-500">Hệ thống hoạt động</span>
              </div>
              <button className="text-xs text-blue-600 hover:text-blue-700">
                Trợ giúp
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}