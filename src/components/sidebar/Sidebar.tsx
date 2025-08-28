"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";

interface NavItem {
  id: string;
  label: string;
  icon: any;
  path: string;
}

const BottomNavigation: React.FC = () => {
  const router = useRouter();
  const currentPath = usePathname();

  // Custom SVG icons extracted from your design
  const HomeIcon = ({ color = "#D1D1D6" }: { color?: string }) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.165 11.253L13.165 3.253C12.9819 3.09 12.7452 2.9999 12.5 2.9999C12.2548 2.9999 12.0181 3.09 11.835 3.253L2.835 11.253C2.7369 11.3404 2.657 11.4462 2.5998 11.5644C2.5425 11.6826 2.5092 11.8109 2.5016 11.9421C2.4939 12.0732 2.5122 12.2045 2.5554 12.3285C2.5985 12.4526 2.6657 12.5669 2.753 12.665C2.8403 12.7631 2.9461 12.8431 3.0643 12.9003C3.1826 12.9575 3.3109 12.9909 3.442 12.9985C3.5731 13.0061 3.7045 12.9878 3.8285 12.9447C3.9526 12.9015 4.0669 12.8344 4.165 12.747L4.5 12.447V20C4.5 20.2653 4.6054 20.5196 4.7929 20.7071C4.9804 20.8947 5.2348 21 5.5 21H9.5C9.7652 21 10.0196 20.8947 10.2071 20.7071C10.3946 20.5196 10.5 20.2653 10.5 20V17C10.5 16.7348 10.6054 16.4805 10.7929 16.2929C10.9804 16.1054 11.2348 16 11.5 16H13.5C13.7652 16 14.0196 16.1054 14.2071 16.2929C14.3946 16.4805 14.5 16.7348 14.5 17V20C14.5 20.2653 14.6054 20.5196 14.7929 20.7071C14.9804 20.8947 15.2348 21 15.5 21H19.5C19.7652 21 20.0196 20.8947 20.2071 20.7071C20.3946 20.5196 20.5 20.2653 20.5 20V12.449L20.835 12.749C20.9331 12.8364 21.0474 12.9035 21.1715 12.9467C21.2955 12.9898 21.4269 13.0081 21.558 13.0005C21.6891 12.9929 21.8174 12.9595 21.9357 12.9023C22.0539 12.8451 22.1597 12.7651 22.247 12.667C22.3343 12.5689 22.4015 12.4546 22.4446 12.3305C22.4878 12.2065 22.506 12.0752 22.4984 11.9441C22.4908 11.8129 22.4575 11.6846 22.4002 11.5664C22.343 11.4482 22.2631 11.3424 22.165 11.255V11.253Z"
        fill={color}
      />
    </svg>
  );

  const BookingIcon = ({ color = "#1B1B1C" }: { color?: string }) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.864 4.4242H17.913C18.599 4.4246 19.257 4.6974 19.742 5.1825C20.227 5.6676 20.5 6.3254 20.5 7.0115V8.9697H0.5V7.0115C0.5 6.3254 0.773 5.6676 1.258 5.1825C1.743 4.6974 2.401 4.4246 3.087 4.4242H4.136V3.5151C4.136 3.2739 4.232 3.0427 4.402 2.8722C4.573 2.7017 4.804 2.606 5.045 2.606C5.286 2.606 5.518 2.7017 5.688 2.8722C5.859 3.0427 5.954 3.2739 5.954 3.5151V4.4242H15.045V3.5151C15.045 3.2739 15.141 3.0427 15.312 2.8722C15.482 2.7017 15.713 2.606 15.955 2.606C16.196 2.606 16.427 2.7017 16.597 2.8722C16.768 3.0427 16.864 3.2739 16.864 3.5151V4.4242ZM0.5 18.8067C0.5 19.4928 0.773 20.1506 1.258 20.6357C1.743 21.1208 2.401 21.3935 3.087 21.394H17.913C18.599 21.3935 19.257 21.1208 19.742 20.6357C20.227 20.1506 20.5 19.4928 20.5 18.8067V9.5757H0.5V18.8067ZM5.045 12.2C5.045 12.0895 5.135 12 5.245 12H7.27C7.38 12 7.47 12.0895 7.47 12.2V14.2243C7.47 14.3347 7.38 14.4243 7.27 14.4243H5.245C5.135 14.4243 5.045 14.3347 5.045 14.2243V12.2ZM9.488 12C9.377 12 9.288 12.0895 9.288 12.2V14.2243C9.288 14.3347 9.377 14.4243 9.488 14.4243H11.512C11.623 14.4243 11.712 14.3347 11.712 14.2243V12.2C11.712 12.0895 11.623 12 11.512 12H9.488ZM13.53 12.2C13.53 12.0895 13.62 12 13.73 12H15.755C15.865 12 15.955 12.0895 15.955 12.2V14.2243C15.955 14.3347 15.865 14.4243 15.755 14.4243H13.73C13.62 14.4243 13.53 14.3347 13.53 14.2243V12.2Z"
        fill={color}
      />
    </svg>
  );

  const BlogIcon = ({ color = "#D1D1D6" }: { color?: string }) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.075 11.55C12.975 10.725 13.5 9.525 13.5 8.25C13.5 5.775 11.475 3.75 9 3.75H3.75C3.375 3.75 3 4.125 3 4.5V19.5C3 19.875 3.375 20.25 3.75 20.25H10.5C12.975 20.25 15 18.225 15 15.75C15 13.8 13.8 12.15 12.075 11.55ZM4.5 5.25H9C10.65 5.25 12 6.6 12 8.25C12 9.9 10.65 11.25 9 11.25H4.5V5.25ZM10.5 18.75H4.5V12.75H10.5C12.15 12.75 13.5 14.1 13.5 15.75C13.5 17.4 12.15 18.75 10.5 18.75Z"
        fill={color}
        stroke={color}
      />
    </svg>
  );

  const MyIcon = ({ color = "#D1D1D6" }: { color?: string }) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.75 7C8.75 4.381 10.881 2.25 13.5 2.25C16.119 2.25 18.25 4.381 18.25 7C18.25 9.619 16.119 11.75 13.5 11.75C10.881 11.75 8.75 9.619 8.75 7ZM16.5 13.25H10.5C7.33 13.25 4.75 15.83 4.75 19C4.75 20.517 5.983 21.75 7.5 21.75H19.5C21.017 21.75 22.25 20.517 22.25 19C22.25 15.83 19.67 13.25 16.5 13.25Z"
        fill={color}
      />
    </svg>
  );

  const navItems: NavItem[] = [
    {
      id: "home",
      label: "Home",
      icon: HomeIcon,
      path: "/dashboard",
    },
    {
      id: "booking",
      label: "Booking",
      icon: BookingIcon,
      path: "/dashboard/booking",
    },
    {
      id: "blog",
      label: "Blog",
      icon: BlogIcon,
      path: "/dashboard/blog",
    },
    {
      id: "my",
      label: "My",
      icon: MyIcon,
      path: "/dashboard/me",
    },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const isActive = (path: string): boolean => {
    if (path === "/dashboard" && currentPath === "/dashboard") {
      return true;
    }
    if (path !== "/dashboard" && currentPath.startsWith(path)) {
      return true;
    }
    return false;
  };

  return (
    <div className="fixed bottom-0   bg-white z-50 py-3 shadow-lg border-t border-[#F2F2F7] flex items-center justify-between w-full sm:max-w-3xl">
      {navItems.map((item) => {
        const active = isActive(item.path);
        const IconComponent = item.icon;

        return (
          <button
            key={item.id}
            onClick={() => handleNavigation(item.path)}
            className="flex flex-col items-center justify-center flex-1 h-full"
            aria-label={item.label}
          >
            <div className="mb-0.5">
              <IconComponent color={active ? "#1B1B1C" : "#D1D1D6"} />
            </div>
            <span
              className="text-[11px] leading-[13px] font-semibold tracking-[0.066px]"
              style={{
                color: active ? "#1B1B1C" : "#D1D1D6",
                scale: active ? 1.1 : 1,
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNavigation;
