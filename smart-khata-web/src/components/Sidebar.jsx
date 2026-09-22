import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  createPortal,
} from "react-dom";

import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  FiGrid,
  FiBox,
  FiUsers,
  FiFileText,
  FiLogOut,
  FiMenu,
  FiChevronLeft,
  FiBarChart2,
  FiMessageSquare,
  FiChevronDown,
  FiSun,
  FiMoon,
  FiUser,
  FiBookOpen,
  FiTruck,
  FiSettings,
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiTrash2,
  FiX,
  FiPackage,
  FiCreditCard,
  FiClock,
  FiAlertCircle,
  FiRefreshCw,
} from "react-icons/fi";

import api from "../api";

import "./Sidebar.css";

// =====================================================
// MENU
// =====================================================

const WHOLESALER_MENU = [
  {
    icon: <FiGrid />,
    name: "Overview",
    path: "/dashboard",
  },

  {
    icon: <FiBox />,
    name: "Stock",
    path: "/stock",
  },

  {
    icon: <FiUsers />,
    name: "Employees",
    path: "/employees",
  },

  {
    icon: <FiTruck />,
    name: "Orders",
    path: "/orders",
  },

  {
    icon: <FiFileText />,
    name: "Billing",
    path: "/billing",
  },

  {
    icon: <FiBookOpen />,
    name: "Ledger",
    path: "/ledger",
  },

  {
    icon: <FiMessageSquare />,
    name: "Reviews",
    path: "/reviews",
  },
];

const RETAILER_MENU = [
  {
    icon: <FiGrid />,
    name: "Overview",
    path: "/dashboard",
  },

  {
    icon: <FiBox />,
    name: "Stock",
    path: "/stock",
  },

  {
    icon: <FiUsers />,
    name: "Customers",
    path: "/customer/products",
  },

  {
    icon: <FiUsers />,
    name: "Employees",
    path: "/employees",
  },

  {
    icon: <FiTruck />,
    name: "Orders",
    path: "/orders",
  },

  {
    icon: <FiFileText />,
    name: "Billing",
    path: "/billing",
  },

  {
    icon: <FiBookOpen />,
    name: "Ledger",
    path: "/ledger",
  },

  {
    icon: <FiBarChart2 />,
    name: "Reports",
    path: "/reports",
  },

  {
    icon: <FiMessageSquare />,
    name: "Reviews",
    path: "/reviews",
  },
];

// =====================================================
// LOCAL USER
// =====================================================

function getStoredUser() {
  try {
    const raw =
      localStorage.getItem(
        "user"
      );

    return raw
      ? JSON.parse(raw)
      : {};
  } catch {
    return {};
  }
}

// =====================================================
// TOOLTIP
// =====================================================

function Tooltip({
  label,
  children,
  visible,
}) {
  if (!visible) {
    return children;
  }

  return (
    <div className="sb-tooltip-wrap">
      {children}

      <span className="sb-tooltip">
        {label}
      </span>
    </div>
  );
}

// =====================================================
// ACCESSIBLE CLICKABLE
// =====================================================

function Clickable({
  as: Tag = "div",
  onClick,
  className,
  children,
  ...rest
}) {
  return (
    <Tag
      className={
        className
      }
      role="button"
      tabIndex={0}
      onClick={
        onClick
      }
      onKeyDown={(
        event
      ) => {
        if (
          event.key ===
            "Enter" ||
          event.key ===
            " "
        ) {
          event.preventDefault();

          onClick?.(
            event
          );
        }
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// =====================================================
// STORAGE
// =====================================================

const COLLAPSED_KEY =
  "skb_sidebar_collapsed";

const THEME_KEY =
  "skb_theme";

// =====================================================
// NOTIFICATION HELPERS
// =====================================================

const getNotificationIcon = (
  type
) => {
  switch (type) {
    case "new_order":
      return (
        <FiPackage />
      );

    case "order_approved":
      return (
        <FiCheckCircle />
      );

    case "order_on_the_way":
      return (
        <FiTruck />
      );

    case "order_delivered":
      return (
        <FiCheckCircle />
      );

    case "order_rejected":
      return (
        <FiX />
      );

    case "advance_requested":
    case "advance_paid":
    case "final_payment_requested":
    case "payment_completed":
      return (
        <FiCreditCard />
      );

    case "bill_sent":
      return (
        <FiFileText />
      );

    default:
      return (
        <FiBell />
      );
  }
};

const getNotificationClass = (
  type
) => {
  switch (type) {
    case "new_order":
      return "sb-notify-blue";

    case "order_approved":
    case "order_delivered":
    case "payment_completed":
    case "advance_paid":
      return "sb-notify-green";

    case "order_on_the_way":
      return "sb-notify-sky";

    case "order_rejected":
      return "sb-notify-red";

    case "advance_requested":
    case "final_payment_requested":
      return "sb-notify-orange";

    case "bill_sent":
      return "sb-notify-purple";

    default:
      return "sb-notify-default";
  }
};

const formatRelativeTime = (
  dateValue
) => {
  if (!dateValue) {
    return "";
  }

  const date =
    new Date(
      dateValue
    );

  const timestamp =
    date.getTime();

  if (
    !Number.isFinite(
      timestamp
    )
  ) {
    return "";
  }

  const difference =
    Date.now() -
    timestamp;

  if (
    difference <
    30 * 1000
  ) {
    return "Just now";
  }

  const minutes =
    Math.floor(
      difference /
        60000
    );

  if (
    minutes <
    60
  ) {
    return `${minutes}m ago`;
  }

  const hours =
    Math.floor(
      minutes /
        60
    );

  if (
    hours <
    24
  ) {
    return `${hours}h ago`;
  }

  const days =
    Math.floor(
      hours /
        24
    );

  if (
    days <
    7
  ) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day:
        "numeric",

      month:
        "short",

      year:
        date.getFullYear() !==
        new Date().getFullYear()
          ? "numeric"
          : undefined,
    }
  );
};

// =====================================================
// SIDEBAR
// =====================================================

export default function Sidebar() {
  const user =
    getStoredUser();

  const role =
    user.role ||
    "Retailer";

  const userName =
    user.name ||
    user.fullName ||
    "User";

  const [
    collapsed,
    setCollapsed,
  ] = useState(
    () =>
      localStorage.getItem(
        COLLAPSED_KEY
      ) === "true"
  );

  const [
    darkMode,
    setDarkMode,
  ] = useState(
    () =>
      localStorage.getItem(
        THEME_KEY
      ) === "dark"
  );

  const [
    showProfile,
    setShowProfile,
  ] = useState(
    false
  );

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(
    false
  );

  // ===================================================
  // NOTIFICATION STATE
  // ===================================================

  const [
    notifications,
    setNotifications,
  ] = useState(
    []
  );

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(
    0
  );

  const [
    showNotifications,
    setShowNotifications,
  ] = useState(
    false
  );

  const [
    notificationLoading,
    setNotificationLoading,
  ] = useState(
    false
  );

  const [
    notificationError,
    setNotificationError,
  ] = useState(
    ""
  );

  const profileRef =
    useRef(null);

  const notificationButtonRef =
    useRef(null);

  const notificationPanelRef =
    useRef(null);

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const menu =
    role ===
    "Wholesaler"
      ? WHOLESALER_MENU
      : RETAILER_MENU;

  // ===================================================
  // NOTIFICATION COUNT
  // ===================================================

  const fetchUnreadCount =
    useCallback(
      async () => {
        try {
          const response =
            await api.get(
              "/api/notifications/unread-count"
            );

          const count =
            Number(
              response
                ?.data
                ?.unreadCount ||
                0
            );

          setUnreadCount(
            Number.isFinite(
              count
            )
              ? count
              : 0
          );
        } catch (error) {
          /*
            Don't show popup error for
            background count polling.
          */

          if (
            error?.response
              ?.status !==
            401
          ) {
            console.error(
              "NOTIFICATION COUNT ERROR:",
              error
            );
          }
        }
      },
      []
    );

  // ===================================================
  // FETCH NOTIFICATIONS
  // ===================================================

  const fetchNotifications =
    useCallback(
      async ({
        silent = false,
      } = {}) => {
        try {
          if (
            !silent
          ) {
            setNotificationLoading(
              true
            );
          }

          const response =
            await api.get(
              "/api/notifications?limit=40"
            );

          const list =
            Array.isArray(
              response
                ?.data
                ?.notifications
            )
              ? response
                  .data
                  .notifications
              : [];

          setNotifications(
            list
          );

          const count =
            Number(
              response
                ?.data
                ?.unreadCount ||
                0
            );

          setUnreadCount(
            Number.isFinite(
              count
            )
              ? count
              : 0
          );

          setNotificationError(
            ""
          );
        } catch (error) {
          console.error(
            "FETCH NOTIFICATIONS ERROR:",
            error
          );

          if (
            !silent
          ) {
            setNotificationError(
              error
                ?.response
                ?.data
                ?.message ||
                "Unable to load notifications."
            );
          }
        } finally {
          if (
            !silent
          ) {
            setNotificationLoading(
              false
            );
          }
        }
      },
      []
    );

  // ===================================================
  // INITIAL + COUNT POLLING
  // ===================================================

  useEffect(() => {
    fetchUnreadCount();

    const timer =
      setInterval(
        () => {
          if (
            document.visibilityState ===
            "visible"
          ) {
            fetchUnreadCount();
          }
        },
        15000
      );

    return () =>
      clearInterval(
        timer
      );
  }, [
    fetchUnreadCount,
  ]);

  // ===================================================
  // OPEN NOTIFICATION PANEL
  // ===================================================

  useEffect(() => {
    if (
      !showNotifications
    ) {
      return;
    }

    fetchNotifications();

    const timer =
      setInterval(
        () => {
          if (
            document.visibilityState ===
            "visible"
          ) {
            fetchNotifications({
              silent:
                true,
            });
          }
        },
        15000
      );

    return () =>
      clearInterval(
        timer
      );
  }, [
    showNotifications,
    fetchNotifications,
  ]);

  // ===================================================
  // CLOSE MENUS ON ROUTE CHANGE
  // ===================================================

  useEffect(() => {
    setMobileOpen(
      false
    );

    setShowNotifications(
      false
    );

    setShowProfile(
      false
    );
  }, [
    location.pathname,
  ]);

  // ===================================================
  // COLLAPSE STORAGE
  // ===================================================

  useEffect(() => {
    localStorage.setItem(
      COLLAPSED_KEY,
      String(
        collapsed
      )
    );
  }, [
    collapsed,
  ]);

  // ===================================================
  // THEME
  // ===================================================

  useEffect(() => {
    localStorage.setItem(
      THEME_KEY,
      darkMode
        ? "dark"
        : "light"
    );

    /*
      Also update the shared project theme key
      used by other SmartKhataBook pages.
    */
    localStorage.setItem(
      "smartkhata-theme",
      darkMode
        ? "dark"
        : "light"
    );

    document.documentElement.setAttribute(
      "data-theme",
      darkMode
        ? "dark"
        : "light"
    );
  }, [
    darkMode,
  ]);

  // ===================================================
  // PROFILE OUTSIDE CLICK
  // ===================================================

  useEffect(() => {
    if (
      !showProfile
    ) {
      return;
    }

    const handleClickOutside =
      (event) => {
        if (
          profileRef.current &&
          !profileRef.current.contains(
            event.target
          )
        ) {
          setShowProfile(
            false
          );
        }
      };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, [
    showProfile,
  ]);

  // ===================================================
  // NOTIFICATION OUTSIDE CLICK
  // ===================================================

  useEffect(() => {
    if (
      !showNotifications
    ) {
      return;
    }

    const handleOutside =
      (event) => {
        const clickedButton =
          notificationButtonRef
            .current
            ?.contains(
              event.target
            );

        const clickedPanel =
          notificationPanelRef
            .current
            ?.contains(
              event.target
            );

        if (
          !clickedButton &&
          !clickedPanel
        ) {
          setShowNotifications(
            false
          );
        }
      };

    document.addEventListener(
      "mousedown",
      handleOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleOutside
      );
  }, [
    showNotifications,
  ]);

  // ===================================================
  // ESCAPE CLOSE
  // ===================================================

  useEffect(() => {
    const handleEscape =
      (event) => {
        if (
          event.key ===
          "Escape"
        ) {
          setShowNotifications(
            false
          );

          setShowProfile(
            false
          );

          setMobileOpen(
            false
          );
        }
      };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () =>
      document.removeEventListener(
        "keydown",
        handleEscape
      );
  }, []);

  // ===================================================
  // LOGOUT
  // ===================================================

  const handleLogout =
    () => {
      localStorage.removeItem(
        "user"
      );

      localStorage.removeItem(
        "token"
      );

      sessionStorage.clear();

      navigate("/");
    };

  // ===================================================
  // MARK ONE READ
  // ===================================================

  const markNotificationRead =
    async (
      notificationId
    ) => {
      if (
        !notificationId
      ) {
        return;
      }

      const current =
        notifications.find(
          (
            notification
          ) =>
            notification._id ===
            notificationId
        );

      if (
        !current ||
        current.isRead
      ) {
        return;
      }

      /*
        Optimistic UI:
        immediately show as read.
      */

      setNotifications(
        (
          previous
        ) =>
          previous.map(
            (
              notification
            ) =>
              notification._id ===
              notificationId
                ? {
                    ...notification,

                    isRead:
                      true,

                    readAt:
                      new Date().toISOString(),
                  }
                : notification
          )
      );

      setUnreadCount(
        (
          previous
        ) =>
          Math.max(
            previous -
              1,
            0
          )
      );

      try {
        await api.patch(
          `/api/notifications/${notificationId}/read`
        );
      } catch (error) {
        console.error(
          "MARK NOTIFICATION ERROR:",
          error
        );

        /*
          Refresh from backend if optimistic
          update failed.
        */

        fetchNotifications({
          silent:
            true,
        });
      }
    };

  // ===================================================
  // OPEN NOTIFICATION
  // ===================================================

  const handleNotificationClick =
    async (
      notification
    ) => {
      if (
        !notification
      ) {
        return;
      }

      if (
        !notification.isRead
      ) {
        await markNotificationRead(
          notification._id
        );
      }

      setShowNotifications(
        false
      );

      setMobileOpen(
        false
      );

      const link =
        String(
          notification.link ||
            ""
        ).trim();

      /*
        Internal navigation only.
      */

      if (
        link.startsWith(
          "/"
        ) &&
        !link.startsWith(
          "//"
        )
      ) {
        navigate(
          link
        );
      }
    };

  // ===================================================
  // MARK ALL READ
  // ===================================================

  const markAllRead =
    async () => {
      if (
        unreadCount <=
        0
      ) {
        return;
      }

      const previousNotifications =
        notifications;

      const previousCount =
        unreadCount;

      setNotifications(
        (
          previous
        ) =>
          previous.map(
            (
              notification
            ) => ({
              ...notification,

              isRead:
                true,

              readAt:
                notification.readAt ||
                new Date().toISOString(),
            })
          )
      );

      setUnreadCount(
        0
      );

      try {
        await api.patch(
          "/api/notifications/read-all"
        );
      } catch (error) {
        console.error(
          "MARK ALL READ ERROR:",
          error
        );

        setNotifications(
          previousNotifications
        );

        setUnreadCount(
          previousCount
        );
      }
    };

  // ===================================================
  // DELETE ONE
  // ===================================================

  const deleteNotification =
    async (
      event,
      notification
    ) => {
      event.stopPropagation();

      if (
        !notification?._id
      ) {
        return;
      }

      const previous =
        notifications;

      setNotifications(
        (
          current
        ) =>
          current.filter(
            (
              item
            ) =>
              item._id !==
              notification._id
          )
      );

      if (
        !notification.isRead
      ) {
        setUnreadCount(
          (
            current
          ) =>
            Math.max(
              current -
                1,
              0
            )
        );
      }

      try {
        await api.delete(
          `/api/notifications/${notification._id}`
        );
      } catch (error) {
        console.error(
          "DELETE NOTIFICATION ERROR:",
          error
        );

        setNotifications(
          previous
        );

        fetchUnreadCount();
      }
    };

  // ===================================================
  // CLEAR ALL
  // ===================================================

  const clearAllNotifications =
    async () => {
      if (
        notifications.length ===
        0
      ) {
        return;
      }

      const accepted =
        window.confirm(
          "Clear all notifications?"
        );

      if (
        !accepted
      ) {
        return;
      }

      const previous =
        notifications;

      const previousCount =
        unreadCount;

      setNotifications(
        []
      );

      setUnreadCount(
        0
      );

      try {
        await api.delete(
          "/api/notifications/clear-all"
        );
      } catch (error) {
        console.error(
          "CLEAR NOTIFICATIONS ERROR:",
          error
        );

        setNotifications(
          previous
        );

        setUnreadCount(
          previousCount
        );
      }
    };

  // ===================================================
  // INITIALS
  // ===================================================

  const initials =
    userName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map(
        (word) =>
          word[0]
      )
      .join("")
      .toUpperCase()
      .slice(0, 2) ||
    "U";

  const displayedUnread =
    unreadCount >
    99
      ? "99+"
      : unreadCount;

  // ===================================================
  // NOTIFICATION PORTAL
  // ===================================================

  const notificationPortal =
    showNotifications &&
    typeof document !==
      "undefined"
      ? createPortal(
          <>
            <div
              className="sb-notify-mobile-overlay"
              onClick={() =>
                setShowNotifications(
                  false
                )
              }
            />

            <section
              ref={
                notificationPanelRef
              }
              className={`sb-notify-panel ${
                darkMode
                  ? "sb-notify-panel-dark"
                  : "sb-notify-panel-light"
              }`}
              aria-label="Notifications"
            >
              {/* HEADER */}

              <div className="sb-notify-header">
                <div className="sb-notify-header-copy">
                  <div className="sb-notify-title-row">
                    <FiBell />

                    <h3>
                      Notifications
                    </h3>

                    {unreadCount >
                      0 && (
                      <span className="sb-notify-header-count">
                        {
                          displayedUnread
                        }
                      </span>
                    )}
                  </div>

                  <p>
                    Order and
                    payment
                    updates
                  </p>
                </div>

                <button
                  type="button"
                  className="sb-notify-close"
                  onClick={() =>
                    setShowNotifications(
                      false
                    )
                  }
                  aria-label="Close notifications"
                >
                  <FiX />
                </button>
              </div>

              {/* ACTIONS */}

              <div className="sb-notify-actions">
                <button
                  type="button"
                  onClick={
                    markAllRead
                  }
                  disabled={
                    unreadCount ===
                    0
                  }
                >
                  <FiCheck />

                  Mark all
                  read
                </button>

                <button
                  type="button"
                  className="sb-notify-clear"
                  onClick={
                    clearAllNotifications
                  }
                  disabled={
                    notifications.length ===
                    0
                  }
                >
                  <FiTrash2 />

                  Clear all
                </button>
              </div>

              {/* CONTENT */}

              <div className="sb-notify-body">
                {notificationLoading && (
                  <div className="sb-notify-state">
                    <FiRefreshCw className="sb-notify-spin" />

                    <strong>
                      Loading
                      notifications
                    </strong>

                    <span>
                      Checking
                      for the
                      latest
                      updates...
                    </span>
                  </div>
                )}

                {!notificationLoading &&
                  notificationError && (
                    <div className="sb-notify-state">
                      <FiAlertCircle />

                      <strong>
                        Unable to
                        load
                        notifications
                      </strong>

                      <span>
                        {
                          notificationError
                        }
                      </span>

                      <button
                        type="button"
                        className="sb-notify-retry"
                        onClick={() =>
                          fetchNotifications()
                        }
                      >
                        Retry
                      </button>
                    </div>
                  )}

                {!notificationLoading &&
                  !notificationError &&
                  notifications.length ===
                    0 && (
                    <div className="sb-notify-state">
                      <div className="sb-notify-empty-icon">
                        <FiBell />
                      </div>

                      <strong>
                        You're all
                        caught up
                      </strong>

                      <span>
                        New order
                        and payment
                        updates will
                        appear here.
                      </span>
                    </div>
                  )}

                {!notificationLoading &&
                  !notificationError &&
                  notifications.length >
                    0 && (
                    <div className="sb-notify-list">
                      {notifications.map(
                        (
                          notification
                        ) => (
                          <article
                            key={
                              notification._id
                            }
                            className={`sb-notify-item ${
                              !notification.isRead
                                ? "sb-notify-item-unread"
                                : ""
                            }`}
                            role="button"
                            tabIndex={
                              0
                            }
                            onClick={() =>
                              handleNotificationClick(
                                notification
                              )
                            }
                            onKeyDown={(
                              event
                            ) => {
                              if (
                                event.key ===
                                  "Enter" ||
                                event.key ===
                                  " "
                              ) {
                                event.preventDefault();

                                handleNotificationClick(
                                  notification
                                );
                              }
                            }}
                          >
                            <div
                              className={`sb-notify-type-icon ${getNotificationClass(
                                notification.type
                              )}`}
                            >
                              {getNotificationIcon(
                                notification.type
                              )}
                            </div>

                            <div className="sb-notify-item-copy">
                              <div className="sb-notify-item-top">
                                <strong>
                                  {notification.title ||
                                    "Notification"}
                                </strong>

                                {!notification.isRead && (
                                  <span className="sb-notify-unread-dot" />
                                )}
                              </div>

                              <p>
                                {notification.message ||
                                  ""}
                              </p>

                              <div className="sb-notify-meta">
                                <FiClock />

                                <span>
                                  {formatRelativeTime(
                                    notification.createdAt
                                  )}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              className="sb-notify-delete"
                              aria-label="Delete notification"
                              title="Delete"
                              onClick={(
                                event
                              ) =>
                                deleteNotification(
                                  event,
                                  notification
                                )
                              }
                            >
                              <FiTrash2 />
                            </button>
                          </article>
                        )
                      )}
                    </div>
                  )}
              </div>
            </section>
          </>,
          document.body
        )
      : null;

  // ===================================================
  // UI
  // ===================================================

  return (
    <>
      <style>
        {
          notificationStyles
        }
      </style>

      {/* MOBILE TRIGGER */}

      <button
        className="sb-mobile-trigger"
        onClick={() =>
          setMobileOpen(
            true
          )
        }
        aria-label="Open menu"
      >
        <FiMenu
          size={20}
        />
      </button>

      {/* MOBILE BACKDROP */}

      {mobileOpen && (
        <div
          className="sb-mobile-backdrop"
          onClick={() =>
            setMobileOpen(
              false
            )
          }
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`sb-sidebar ${
          collapsed
            ? "sb-collapsed"
            : ""
        } ${
          darkMode
            ? "sb-dark"
            : "sb-light"
        } ${
          mobileOpen
            ? "sb-mobile-open"
            : ""
        }`}
      >
        {/* HEADER */}

        <div className="sb-header">
          <div className="sb-brand">
            <div className="sb-brand-icon">
              <svg
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                viewBox="0 0 24 24"
              >
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />

                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>

            {!collapsed && (
              <div className="sb-brand-text">
                <span className="sb-brand-name">
                  Smart
                  Khatabook
                </span>

                <span className="sb-role-badge">
                  {role}
                </span>
              </div>
            )}
          </div>

          <button
            className="sb-toggle"
            onClick={() =>
              setCollapsed(
                !collapsed
              )
            }
            aria-label={
              collapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
          >
            {collapsed ? (
              <FiMenu
                size={
                  16
                }
              />
            ) : (
              <FiChevronLeft
                size={
                  16
                }
              />
            )}
          </button>
        </div>

        <div className="sb-divider" />

        {/* MENU */}

        <div className="sb-scroll">
          {!collapsed && (
            <p className="sb-section-label">
              Main Menu
            </p>
          )}

          <nav className="sb-nav">
            {menu.map(
              (
                item,
                index
              ) => {
                const active =
                  location.pathname ===
                  item.path;

                return (
                  <Tooltip
                    key={
                      index
                    }
                    label={
                      item.name
                    }
                    visible={
                      collapsed
                    }
                  >
                    <Clickable
                      className={`sb-item ${
                        active
                          ? "sb-item-active"
                          : ""
                      }`}
                      onClick={() =>
                        navigate(
                          item.path
                        )
                      }
                      title={
                        collapsed
                          ? item.name
                          : undefined
                      }
                      aria-current={
                        active
                          ? "page"
                          : undefined
                      }
                      aria-label={
                        item.name
                      }
                    >
                      {active && (
                        <span className="sb-active-bar" />
                      )}

                      <span className="sb-item-icon">
                        {
                          item.icon
                        }
                      </span>

                      {!collapsed && (
                        <span className="sb-item-label">
                          {
                            item.name
                          }
                        </span>
                      )}
                    </Clickable>
                  </Tooltip>
                );
              }
            )}
          </nav>
        </div>

        {/* BOTTOM */}

        <div className="sb-bottom">
          <div className="sb-divider" />

          {/* ===============================
              NOTIFICATIONS
          ================================ */}

          <Tooltip
            label="Notifications"
            visible={
              collapsed
            }
          >
            <div
              ref={
                notificationButtonRef
              }
              className="sb-notification-button-wrap"
            >
              <Clickable
                className={`sb-item sb-notification-trigger ${
                  showNotifications
                    ? "sb-notification-trigger-open"
                    : ""
                }`}
                onClick={() => {
                  setShowProfile(
                    false
                  );

                  setShowNotifications(
                    (
                      previous
                    ) =>
                      !previous
                  );
                }}
                aria-haspopup="dialog"
                aria-expanded={
                  showNotifications
                }
                aria-label={
                  unreadCount >
                  0
                    ? `Notifications, ${unreadCount} unread`
                    : "Notifications"
                }
              >
                <span className="sb-item-icon sb-bell-icon">
                  <FiBell
                    size={
                      16
                    }
                  />

                  {unreadCount >
                    0 && (
                    <span className="sb-sidebar-notification-badge">
                      {
                        displayedUnread
                      }
                    </span>
                  )}
                </span>

                {!collapsed && (
                  <>
                    <span className="sb-item-label">
                      Notifications
                    </span>

                    {unreadCount >
                      0 && (
                      <span className="sb-notification-side-count">
                        {
                          displayedUnread
                        }
                      </span>
                    )}
                  </>
                )}
              </Clickable>
            </div>
          </Tooltip>

          {/* DARK MODE */}

          <Tooltip
            label={
              darkMode
                ? "Light mode"
                : "Dark mode"
            }
            visible={
              collapsed
            }
          >
            <Clickable
              className="sb-item sb-theme-toggle"
              onClick={() =>
                setDarkMode(
                  !darkMode
                )
              }
              aria-pressed={
                darkMode
              }
              aria-label={
                darkMode
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              <span className="sb-item-icon">
                {darkMode ? (
                  <FiSun
                    size={
                      16
                    }
                  />
                ) : (
                  <FiMoon
                    size={
                      16
                    }
                  />
                )}
              </span>

              {!collapsed && (
                <span className="sb-item-label">
                  {darkMode
                    ? "Light mode"
                    : "Dark mode"}
                </span>
              )}
            </Clickable>
          </Tooltip>

          {/* PROFILE */}

          <div
            className="sb-profile-wrap"
            ref={
              profileRef
            }
          >
            {showProfile &&
              !collapsed && (
                <div
                  className="sb-dropdown"
                  role="menu"
                >
                  <Clickable
                    className="sb-dropdown-item"
                    role="menuitem"
                    onClick={() => {
                      setShowProfile(
                        false
                      );

                      navigate(
                        "/profile"
                      );
                    }}
                  >
                    <FiUser
                      size={
                        13
                      }
                    />

                    View profile
                  </Clickable>

                  <Clickable
                    className="sb-dropdown-item"
                    role="menuitem"
                    onClick={() => {
                      setShowProfile(
                        false
                      );

                      navigate(
                        "/settings"
                      );
                    }}
                  >
                    <FiSettings
                      size={
                        13
                      }
                    />

                    Settings
                  </Clickable>

                  <div className="sb-dropdown-divider" />

                  <Clickable
                    className="sb-dropdown-item sb-dropdown-logout"
                    role="menuitem"
                    onClick={
                      handleLogout
                    }
                  >
                    <FiLogOut
                      size={
                        13
                      }
                    />

                    Logout
                  </Clickable>
                </div>
              )}

            <Tooltip
              label={
                userName
              }
              visible={
                collapsed
              }
            >
              <Clickable
                className={`sb-profile ${
                  showProfile
                    ? "sb-profile-open"
                    : ""
                }`}
                onClick={() => {
                  setShowNotifications(
                    false
                  );

                  setShowProfile(
                    (
                      previous
                    ) =>
                      !previous
                  );
                }}
                aria-haspopup="menu"
                aria-expanded={
                  showProfile
                }
                aria-label={`${userName}, account menu`}
              >
                <div className="sb-avatar">
                  {
                    initials
                  }
                </div>

                {!collapsed && (
                  <>
                    <div className="sb-profile-text">
                      <span className="sb-profile-name">
                        {
                          userName
                        }
                      </span>

                      <span className="sb-profile-role">
                        {
                          role
                        }
                      </span>
                    </div>

                    <FiChevronDown
                      size={
                        13
                      }
                      className={`sb-chevron ${
                        showProfile
                          ? "sb-chevron-up"
                          : ""
                      }`}
                    />
                  </>
                )}
              </Clickable>
            </Tooltip>
          </div>

          {/* COLLAPSED LOGOUT */}

          {collapsed && (
            <Tooltip
              label="Logout"
              visible={
                true
              }
            >
              <Clickable
                className="sb-item sb-logout-icon"
                onClick={
                  handleLogout
                }
                aria-label="Logout"
              >
                <span className="sb-item-icon">
                  <FiLogOut
                    size={
                      16
                    }
                  />
                </span>
              </Clickable>
            </Tooltip>
          )}
        </div>
      </aside>

      {notificationPortal}
    </>
  );
}

// =====================================================
// NOTIFICATION CSS
// =====================================================

const notificationStyles = `
  .sb-notification-button-wrap {
    width: 100%;
    min-width: 0;
  }

  .sb-notification-trigger {
    position: relative;
  }

  .sb-notification-trigger-open {
    background: rgba(99, 102, 241, 0.10) !important;
  }

  .sb-bell-icon {
    position: relative;
    overflow: visible !important;
  }

  .sb-sidebar-notification-badge {
    position: absolute;
    top: -8px;
    right: -10px;

    min-width: 17px;
    height: 17px;

    padding: 0 4px;

    border: 2px solid var(--sb-bg, #ffffff);
    border-radius: 999px;

    background: #ef4444;
    color: #ffffff;

    display: inline-flex;
    align-items: center;
    justify-content: center;

    font-size: 8px;
    line-height: 1;
    font-weight: 800;

    box-shadow: 0 3px 8px rgba(239, 68, 68, 0.28);

    pointer-events: none;
  }

  .sb-notification-side-count {
    margin-left: auto;

    min-width: 21px;
    height: 21px;

    padding: 0 6px;

    border-radius: 999px;

    background: #ef4444;
    color: #ffffff;

    display: inline-flex;
    align-items: center;
    justify-content: center;

    font-size: 9px;
    font-weight: 800;

    line-height: 1;
  }

  /* ===================================================
     PORTAL
     =================================================== */

  .sb-notify-panel,
  .sb-notify-panel *,
  .sb-notify-panel *::before,
  .sb-notify-panel *::after {
    box-sizing: border-box;
  }

  .sb-notify-panel {
    --sn-bg: #ffffff;
    --sn-soft: #f8fafc;
    --sn-hover: #f5f7fb;
    --sn-text: #0f172a;
    --sn-secondary: #475569;
    --sn-muted: #94a3b8;
    --sn-border: #e5eaf1;

    position: fixed;

    left: max(82px, calc(env(safe-area-inset-left) + 82px));
    bottom: max(18px, env(safe-area-inset-bottom));

    z-index: 100000;

    width: min(390px, calc(100vw - 105px));
    max-height: min(650px, calc(100dvh - 36px));

    border: 1px solid var(--sn-border);
    border-radius: 20px;

    background: var(--sn-bg);
    color: var(--sn-text);

    box-shadow:
      0 24px 70px rgba(15, 23, 42, 0.18),
      0 6px 20px rgba(15, 23, 42, 0.07);

    overflow: hidden;

    display: flex;
    flex-direction: column;

    font-family:
      "Inter",
      "Segoe UI",
      system-ui,
      -apple-system,
      sans-serif;

    animation: sbNotifyOpen 0.18s ease;
  }

  .sb-notify-panel-dark {
    --sn-bg: #111827;
    --sn-soft: #182235;
    --sn-hover: #1c293d;
    --sn-text: #f8fafc;
    --sn-secondary: #cbd5e1;
    --sn-muted: #8290a5;
    --sn-border: #283548;

    color-scheme: dark;

    box-shadow:
      0 28px 80px rgba(0, 0, 0, 0.42),
      0 8px 24px rgba(0, 0, 0, 0.22);
  }

  @keyframes sbNotifyOpen {
    from {
      opacity: 0;
      transform: translateY(8px) scale(0.98);
    }

    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* ===================================================
     HEADER
     =================================================== */

  .sb-notify-header {
    padding: 17px 18px 13px;

    border-bottom: 1px solid var(--sn-border);

    display: flex;
    align-items: flex-start;
    justify-content: space-between;

    gap: 12px;
  }

  .sb-notify-header-copy {
    min-width: 0;
  }

  .sb-notify-title-row {
    display: flex;
    align-items: center;

    gap: 7px;

    min-width: 0;
  }

  .sb-notify-title-row > svg {
    width: 17px;
    height: 17px;

    flex-shrink: 0;

    color: #6366f1;
  }

  .sb-notify-title-row h3 {
    margin: 0;

    color: var(--sn-text);

    font-size: 15px;
    line-height: 1.25;

    font-weight: 800;
  }

  .sb-notify-header-count {
    min-width: 20px;
    height: 20px;

    padding: 0 5px;

    border-radius: 999px;

    background: #ef4444;
    color: #ffffff;

    display: inline-flex;
    align-items: center;
    justify-content: center;

    font-size: 9px;
    font-weight: 800;
  }

  .sb-notify-header-copy p {
    margin: 4px 0 0;

    color: var(--sn-muted);

    font-size: 10px;
    line-height: 1.4;
  }

  .sb-notify-close {
    width: 31px;
    height: 31px;

    flex: 0 0 31px;

    padding: 0;

    border: 1px solid var(--sn-border);
    border-radius: 9px;

    background: var(--sn-soft);
    color: var(--sn-secondary);

    display: grid;
    place-items: center;

    cursor: pointer;

    transition:
      background 0.15s ease,
      color 0.15s ease,
      transform 0.15s ease;
  }

  .sb-notify-close:hover {
    background: var(--sn-hover);
    color: #ef4444;

    transform: translateY(-1px);
  }

  .sb-notify-close svg {
    width: 15px;
    height: 15px;
  }

  /* ===================================================
     ACTIONS
     =================================================== */

  .sb-notify-actions {
    padding: 9px 12px;

    border-bottom: 1px solid var(--sn-border);

    background: var(--sn-soft);

    display: flex;
    align-items: center;

    gap: 7px;
  }

  .sb-notify-actions button {
    min-height: 31px;

    padding: 6px 9px;

    border: 1px solid var(--sn-border);
    border-radius: 8px;

    background: var(--sn-bg);
    color: var(--sn-secondary);

    display: inline-flex;
    align-items: center;
    justify-content: center;

    gap: 5px;

    font-family: inherit;
    font-size: 9px;
    font-weight: 700;

    cursor: pointer;

    transition:
      background 0.15s ease,
      color 0.15s ease,
      border-color 0.15s ease;
  }

  .sb-notify-actions button:hover:not(:disabled) {
    color: #6366f1;
    border-color: rgba(99, 102, 241, 0.30);
  }

  .sb-notify-actions button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .sb-notify-actions .sb-notify-clear {
    margin-left: auto;
  }

  .sb-notify-actions .sb-notify-clear:hover:not(:disabled) {
    color: #ef4444;
    border-color: rgba(239, 68, 68, 0.28);
  }

  /* ===================================================
     BODY
     =================================================== */

  .sb-notify-body {
    min-height: 130px;
    max-height: 510px;

    overflow-y: auto;
    overscroll-behavior: contain;

    scrollbar-width: thin;
  }

  .sb-notify-list {
    display: flex;
    flex-direction: column;
  }

  .sb-notify-item {
    position: relative;

    min-width: 0;

    padding: 13px 13px;

    border-bottom: 1px solid var(--sn-border);

    background: var(--sn-bg);

    display: grid;

    grid-template-columns:
      37px minmax(0, 1fr) 26px;

    gap: 10px;

    cursor: pointer;

    outline: none;

    transition:
      background 0.15s ease,
      transform 0.15s ease;
  }

  .sb-notify-item:last-child {
    border-bottom: none;
  }

  .sb-notify-item:hover,
  .sb-notify-item:focus-visible {
    background: var(--sn-hover);
  }

  .sb-notify-item-unread {
    background:
      linear-gradient(
        90deg,
        rgba(99, 102, 241, 0.08),
        transparent 60%
      );
  }

  .sb-notify-item-unread::before {
    content: "";

    position: absolute;

    left: 0;
    top: 10px;
    bottom: 10px;

    width: 3px;

    border-radius: 0 4px 4px 0;

    background: #6366f1;
  }

  /* ===================================================
     NOTIFICATION ICON
     =================================================== */

  .sb-notify-type-icon {
    width: 37px;
    height: 37px;

    flex: 0 0 37px;

    border-radius: 11px;

    display: grid;
    place-items: center;
  }

  .sb-notify-type-icon svg {
    width: 16px;
    height: 16px;
  }

  .sb-notify-blue {
    background: rgba(99, 102, 241, 0.12);
    color: #6366f1;
  }

  .sb-notify-green {
    background: rgba(34, 197, 94, 0.12);
    color: #16a34a;
  }

  .sb-notify-sky {
    background: rgba(14, 165, 233, 0.12);
    color: #0284c7;
  }

  .sb-notify-red {
    background: rgba(239, 68, 68, 0.12);
    color: #ef4444;
  }

  .sb-notify-orange {
    background: rgba(245, 158, 11, 0.13);
    color: #d97706;
  }

  .sb-notify-purple {
    background: rgba(139, 92, 246, 0.12);
    color: #8b5cf6;
  }

  .sb-notify-default {
    background: var(--sn-soft);
    color: var(--sn-secondary);
  }

  /* ===================================================
     ITEM COPY
     =================================================== */

  .sb-notify-item-copy {
    min-width: 0;
  }

  .sb-notify-item-top {
    min-width: 0;

    display: flex;
    align-items: center;

    gap: 6px;
  }

  .sb-notify-item-top strong {
    min-width: 0;

    color: var(--sn-text);

    font-size: 11px;
    line-height: 1.35;

    font-weight: 800;

    overflow-wrap: anywhere;
  }

  .sb-notify-unread-dot {
    width: 6px;
    height: 6px;

    flex: 0 0 6px;

    border-radius: 50%;

    background: #6366f1;

    box-shadow:
      0 0 0 3px rgba(99, 102, 241, 0.10);
  }

  .sb-notify-item-copy p {
    margin: 4px 0 6px;

    color: var(--sn-secondary);

    font-size: 9.5px;
    line-height: 1.5;

    overflow-wrap: anywhere;
  }

  .sb-notify-meta {
    color: var(--sn-muted);

    display: flex;
    align-items: center;

    gap: 4px;

    font-size: 8.5px;
    font-weight: 600;
  }

  .sb-notify-meta svg {
    width: 10px;
    height: 10px;
  }

  /* ===================================================
     DELETE
     =================================================== */

  .sb-notify-delete {
    width: 26px;
    height: 26px;

    padding: 0;

    border: none;
    border-radius: 7px;

    background: transparent;
    color: var(--sn-muted);

    display: grid;
    place-items: center;

    cursor: pointer;

    opacity: 0;

    transition:
      opacity 0.15s ease,
      color 0.15s ease,
      background 0.15s ease;
  }

  .sb-notify-item:hover .sb-notify-delete,
  .sb-notify-delete:focus-visible {
    opacity: 1;
  }

  .sb-notify-delete:hover {
    background: rgba(239, 68, 68, 0.10);
    color: #ef4444;
  }

  .sb-notify-delete svg {
    width: 13px;
    height: 13px;
  }

  /* ===================================================
     EMPTY / ERROR / LOADING
     =================================================== */

  .sb-notify-state {
    min-height: 210px;

    padding: 28px 22px;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    text-align: center;
  }

  .sb-notify-state > svg {
    width: 22px;
    height: 22px;

    margin-bottom: 10px;

    color: #6366f1;
  }

  .sb-notify-empty-icon {
    width: 48px;
    height: 48px;

    margin-bottom: 12px;

    border-radius: 15px;

    background: rgba(99, 102, 241, 0.10);
    color: #6366f1;

    display: grid;
    place-items: center;
  }

  .sb-notify-empty-icon svg {
    width: 21px;
    height: 21px;
  }

  .sb-notify-state strong {
    color: var(--sn-text);

    font-size: 12px;
    font-weight: 800;
  }

  .sb-notify-state span {
    max-width: 240px;

    margin-top: 5px;

    color: var(--sn-muted);

    font-size: 9.5px;
    line-height: 1.55;
  }

  .sb-notify-retry {
    min-height: 31px;

    margin-top: 12px;
    padding: 6px 14px;

    border: none;
    border-radius: 8px;

    background: #6366f1;
    color: #ffffff;

    font-family: inherit;
    font-size: 9px;
    font-weight: 800;

    cursor: pointer;
  }

  .sb-notify-spin {
    animation: sbNotifySpin 0.75s linear infinite;
  }

  @keyframes sbNotifySpin {
    to {
      transform: rotate(360deg);
    }
  }

  /* ===================================================
     MOBILE OVERLAY
     =================================================== */

  .sb-notify-mobile-overlay {
    display: none;
  }

  /* ===================================================
     TABLET / MOBILE
     =================================================== */

  @media (max-width: 768px) {
    .sb-notify-mobile-overlay {
      position: fixed;
      inset: 0;

      z-index: 99998;

      display: block;

      background: rgba(15, 23, 42, 0.35);

      backdrop-filter: blur(2px);
    }

    .sb-notify-panel {
      left: 10px;
      right: 10px;

      bottom:
        max(10px, env(safe-area-inset-bottom));

      width: auto;

      max-height:
        min(
          78dvh,
          650px
        );

      z-index: 99999;

      border-radius: 20px;

      animation: sbNotifyMobileOpen 0.22s ease;
    }

    @keyframes sbNotifyMobileOpen {
      from {
        opacity: 0;
        transform: translateY(20px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .sb-notify-body {
      max-height:
        calc(
          78dvh - 115px
        );
    }

    .sb-notify-delete {
      opacity: 1;
    }
  }

  /* ===================================================
     SMALL MOBILE
     =================================================== */

  @media (max-width: 420px) {
    .sb-notify-panel {
      left: 6px;
      right: 6px;

      bottom:
        max(6px, env(safe-area-inset-bottom));

      border-radius: 17px;
    }

    .sb-notify-header {
      padding: 14px;
    }

    .sb-notify-actions {
      padding: 8px 10px;
    }

    .sb-notify-item {
      padding: 12px 10px;

      grid-template-columns:
        34px minmax(0, 1fr) 25px;

      gap: 8px;
    }

    .sb-notify-type-icon {
      width: 34px;
      height: 34px;
    }

    .sb-notify-actions button {
      padding-inline: 7px;
      font-size: 8.5px;
    }
  }

  /* ===================================================
     TOUCH
     =================================================== */

  @media (hover: none) {
    .sb-notify-delete {
      opacity: 1;
    }

    .sb-notify-close:hover,
    .sb-notify-item:hover {
      transform: none;
    }
  }

  /* ===================================================
     REDUCED MOTION
     =================================================== */

  @media (prefers-reduced-motion: reduce) {
    .sb-notify-panel,
    .sb-notify-panel *,
    .sb-notify-panel *::before,
    .sb-notify-panel *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;