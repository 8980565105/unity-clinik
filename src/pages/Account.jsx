import React from "react";
import UserProfile from "../components/userAccount/UserProfile";
// import AccountTabs from "../components/userAccount/AccountTabs";
import AccountDetails from "../components/AccountDetails/AccountDetails";

export default function MyAccount() {
  return (
    <div>
      <UserProfile/>
      {/* <AccountTabs /> */}
      <AccountDetails/>

    </div>
  );
}
