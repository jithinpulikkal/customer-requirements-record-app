import { Alert, BackHandler, StatusBar, View } from "react-native";
import { useEffect } from "react";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import tw from "twrnc";
import BottomBar from "./src/components/BottomBar";
import { useCustomerController } from "./src/controllers/useCustomerController";
import DetailView from "./src/views/DetailView";
import ExportView from "./src/views/ExportView";
import FormView from "./src/views/FormView";
import GetStartedView from "./src/views/GetStartedView";
import ListView from "./src/views/ListView";
import LoginView from "./src/views/LoginView";
import ProfileView from "./src/views/ProfileView";
import SettingsView from "./src/views/SettingsView";
import StatusView from "./src/views/StatusView";

export default function App() {
  return (
    <SafeAreaProvider>
      <AppShell />
    </SafeAreaProvider>
  );
}

function AppShell() {
  const controller = useCustomerController();
  const insets = useSafeAreaInsets();
  const mainScreens = ["list", "profile", "status", "settings", "export"];

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (controller.screen === "status") {
        Alert.alert("Exit app", "Do you want to close the app?", [
          { text: "Cancel", style: "cancel" },
          { text: "Exit", style: "destructive", onPress: () => BackHandler.exitApp() }
        ]);
        return true;
      }

      if (["list", "profile", "export", "settings"].includes(controller.screen)) {
        controller.setScreen("status");
        return true;
      }

      if (["detail", "form", "login"].includes(controller.screen)) {
        controller.goBack(controller.loggedIn ? "status" : "start");
        return true;
      }

      if (controller.screen === "start") {
        Alert.alert("Exit app", "Do you want to close the app?", [
          { text: "Cancel", style: "cancel" },
          { text: "Exit", style: "destructive", onPress: () => BackHandler.exitApp() }
        ]);
        return true;
      }

      return false;
    });

    return () => subscription.remove();
  }, [controller]);

  return (
    <View style={tw`flex-1 ${controller.theme.page}`}>
      <StatusBar
        backgroundColor={controller.themeMode === "dark" ? "#171717" : "#eef0f4"}
        barStyle={controller.themeMode === "dark" ? "light-content" : "dark-content"}
      />
      <View style={[tw`flex-1`, { paddingTop: insets.top }]}>
        {controller.screen === "start" && <GetStartedView controller={controller} />}
        {controller.screen === "login" && <LoginView controller={controller} />}
        {controller.screen === "list" && <ListView controller={controller} />}
        {controller.screen === "export" && <ExportView controller={controller} />}
        {controller.screen === "form" && <FormView controller={controller} />}
        {controller.screen === "detail" && controller.selectedEntry && (
          <DetailView controller={controller} entry={controller.selectedEntry} />
        )}
        {controller.screen === "profile" && <ProfileView controller={controller} />}
        {controller.screen === "status" && <StatusView controller={controller} />}
        {controller.screen === "settings" && <SettingsView controller={controller} />}
        {mainScreens.includes(controller.screen) ? <BottomBar controller={controller} bottomInset={insets.bottom} /> : null}
      </View>
    </View>
  );
}
