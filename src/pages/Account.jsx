import React, { useState } from "react";
import UserProfile from "../components/userAccount/UserProfile";
import AccountDetails from "../components/AccountDetails/AccountDetails";
import Row from "../components/ui/Row";
import Address from "../components/Address/Address";
import Section from "../components/ui/Section";

export default function MyAccount() {
  const [activeTab, setActiveTab] = useState("address");

  return (
    <div>
      <UserProfile />
      <Section>
        <Row className="flex flex-col md:flex-row gap-4 md:gap-6">
          <div className="md:w-[240px] shrink-0">
            <div className="bg-white rounded-xl border border-brand-border overflow-hidden">
              <button
                onClick={() => setActiveTab("address")}
                className={`w-full flex items-center space-x-3 px-4 py-3.5 text-sm font-medium border-b border-brand-border transition-all ${
                  activeTab === "address"
                    ? "bg-blue-50 text-brand-primary border-l-[3px] border-l-brand-primary"
                    : "text-brand-gray hover:bg-gray-50"
                }`}
              >
                <span
                  className={
                    activeTab === "address"
                      ? "text-brand-primary"
                      : "text-brand-muted"
                  }
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                    />
                  </svg>
                </span>
                <span>Addresses</span>
              </button>

              <button
                onClick={() => setActiveTab("account")}
                className={`w-full flex items-center space-x-3 px-4 py-3.5 text-sm font-medium border-b border-brand-border transition-all ${
                  activeTab === "account"
                    ? "bg-blue-50 text-brand-primary border-l-[3px] border-l-brand-primary"
                    : "text-brand-gray hover:bg-gray-50"
                }`}
              >
                <span
                  className={
                    activeTab === "account"
                      ? "text-brand-primary"
                      : "text-brand-muted"
                  }
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </span>
                <span>Account Settings</span>
              </button>
            </div>
          </div>

          <div className="flex-1 min-w-0 pb-8">
            {activeTab === "address" && <Address />}
            {activeTab === "account" && <AccountDetails />}
          </div>
        </Row>
      </Section>
    </div>
  );
}
