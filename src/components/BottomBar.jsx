import { ChartPie, List, Plus, Share, UserRound } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import tw from "twrnc";

export default function BottomBar({ bottomInset = 0, controller }) {
  return (
    <View style={[tw`absolute left-5 right-5`, { bottom: Math.max(bottomInset, 12) }]}>
      <View style={tw`h-18 px-3 flex-row items-center justify-between ${controller.theme.bottom} rounded-full shadow-lg`}>
        <TabButton
          active={controller.screen === "dashboard"}
          controller={controller}
          icon={ChartPie}
          label="Dashboard"
          onPress={() => controller.setScreen("dashboard")}
        />
        <TabButton
          active={controller.screen === "list"}
          controller={controller}
          icon={List}
          label="Entries"
          onPress={() => controller.setScreen("list")}
        />
        <Pressable
          onPress={controller.openCreate}
          style={tw`w-14 h-14 items-center justify-center rounded-full ${controller.theme.primary} shadow-lg`}
        >
          <Plus size={26} color={controller.themeMode === "dark" ? "#171717" : "#ffffff"} />
        </Pressable>
        <TabButton
          active={controller.screen === "export"}
          controller={controller}
          icon={Share}
          label="Export"
          onPress={() => controller.setScreen("export")}
        />
        <TabButton
          active={controller.screen === "profile"}
          controller={controller}
          icon={UserRound}
          label="Profile"
          onPress={() => controller.setScreen("profile")}
        />
      </View>
    </View>
  );
}

function TabButton({ active = false, controller, icon: Icon, label, onPress }) {
  return (
    <Pressable onPress={onPress} style={tw`w-13 items-center justify-center`}>
      <Icon size={20} color={active ? controller.theme.accentColor : controller.theme.iconMuted} />
      <Text style={tw`mt-1 text-[10px] font-black ${active ? controller.theme.accentText : controller.theme.muted}`}>
        {label}
      </Text>
    </Pressable>
  );
}
