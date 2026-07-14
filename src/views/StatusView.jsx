import { Activity, CirclePause, Clock3, ClipboardList, ListChecks, TrendingUp, Trophy, XCircle } from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import tw from "twrnc";
import Header from "../components/Header";
import { statuses } from "../constants/appConstants";

const statusMeta = {
  "Newly Added": { color: "#57a7ff", bg: "bg-[#f2f8ff]", icon: Clock3 },
  "Currently Running": { color: "#f3a712", bg: "bg-[#fff8e8]", icon: Activity },
  Completed: { color: "#24a77e", bg: "bg-[#effbf6]", icon: Trophy },
  "On Hold": { color: "#7467d6", bg: "bg-[#f4f2ff]", icon: CirclePause },
  Cancelled: { color: "#e54960", bg: "bg-[#fff1f3]", icon: XCircle }
};

export default function StatusView({ controller }) {
  const total = controller.stats.total;
  const completed = controller.stats.completed;
  const progress = total ? completed / total : 0;
  const activeWork = controller.stats.running + controller.stats.onHold + controller.stats.newlyAdded;
  const openStatus = (status) => {
    controller.setFilter({ ...controller.filter, status });
    controller.setScreen("list");
  };

  return (
    <View style={tw`flex-1 ${controller.theme.page}`}>
      <Header controller={controller} title="Dashboard" />
      <ScrollView contentContainerStyle={tw`px-5 pb-44`}>
        <View style={tw`p-5 ${controller.theme.card} rounded-[32px] shadow-sm border ${controller.theme.border}`}>
          <View style={tw`flex-row items-start justify-between`}>
            <View style={tw`flex-1 pr-4`}>
              <Text style={tw`text-xs font-black uppercase tracking-wide ${controller.theme.accentText}`}>
                Business overview
              </Text>
              <Text style={tw`mt-2 text-4xl font-black ${controller.theme.text}`}>{total}</Text>
              <Text style={tw`mt-1 text-sm font-bold ${controller.theme.muted}`}>total customer entries</Text>
            </View>
            <View style={tw`w-16 h-16 items-center justify-center rounded-3xl ${controller.theme.cardAlt}`}>
              <ClipboardList size={28} color={controller.theme.accentColor} />
            </View>
          </View>

          <View style={tw`flex-row gap-3 mt-5`}>
            <HeroMetric controller={controller} label="Active" value={activeWork} />
            <HeroMetric controller={controller} label="Completed" value={completed} onPress={() => openStatus("Completed")} />
            <HeroMetric controller={controller} label="Cancelled" value={controller.stats.cancelled} onPress={() => openStatus("Cancelled")} />
          </View>
        </View>

        <View style={tw`mt-4 p-5 ${controller.theme.card} rounded-[32px] shadow-sm border ${controller.theme.border}`}>
          <View style={tw`flex-row items-center justify-between`}>
            <View>
              <Text style={tw`text-lg font-black ${controller.theme.text}`}>Completion</Text>
              <Text style={tw`mt-1 text-sm font-bold ${controller.theme.muted}`}>Completed against total work</Text>
            </View>
            <View style={tw`px-3 py-2 rounded-full ${controller.theme.cardAlt}`}>
              <Text style={tw`text-xs font-black ${controller.theme.text}`}>{Math.round(progress * 100)}%</Text>
            </View>
          </View>

          <View style={tw`items-center mt-3`}>
            <ProgressRing controller={controller} progress={progress} />
          </View>
        </View>

        <View style={tw`flex-row gap-3 mt-4`}>
          <MiniMetric controller={controller} label="Running" value={controller.stats.running} color="#f3a712" onPress={() => openStatus("Currently Running")} />
          <MiniMetric controller={controller} label="On Hold" value={controller.stats.onHold} color="#7467d6" onPress={() => openStatus("On Hold")} />
          <MiniMetric controller={controller} label="New" value={controller.stats.newlyAdded} color="#57a7ff" onPress={() => openStatus("Newly Added")} />
        </View>

        <View style={tw`mt-5 ${controller.theme.card} rounded-[32px] shadow-sm border ${controller.theme.border} overflow-hidden`}>
          <View style={tw`px-5 py-4 flex-row items-center justify-between border-b ${controller.theme.border}`}>
            <View style={tw`flex-row items-center`}>
              <ListChecks size={18} color={controller.themeMode === "dark" ? "#f4f1ea" : "#20252d"} />
              <Text style={tw`ml-2 text-lg font-black ${controller.theme.text}`}>Status breakdown</Text>
            </View>
            <TrendingUp size={18} color={controller.theme.accentColor} />
          </View>

          <View style={tw`p-4`}>
          {statuses.map((status) => {
            const count = controller.stats.byStatus[status] || 0;
            const percent = total ? Math.round((count / total) * 100) : 0;
            return (
              <StatusRow
                controller={controller}
                key={status}
                count={count}
                onPress={() => openStatus(status)}
                percent={percent}
                status={status}
              />
            );
          })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function ProgressRing({ controller, progress }) {
  const size = 168;
  const stroke = 13;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);
  const trackColor = controller.themeMode === "dark" ? "#3a3a3a" : "#e8ecf2";
  const textColor = controller.themeMode === "dark" ? "#f4f1ea" : "#20252d";

  return (
    <View style={tw`items-center justify-center`}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#24a77e"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={tw`absolute items-center`}>
        <Trophy size={34} color="#24a77e" />
        <Text style={[tw`mt-2 text-xl font-black`, { color: textColor }]}>{Math.round(progress * 100)}%</Text>
      </View>
    </View>
  );
}

function HeroMetric({ controller, label, onPress, value }) {
  const Wrapper = onPress ? Pressable : View;
  return (
    <Wrapper onPress={onPress} style={tw`flex-1 p-3 rounded-2xl ${controller.theme.cardAlt}`}>
      <Text style={tw`text-xs font-black ${controller.theme.muted}`}>{label}</Text>
      <Text style={tw`mt-1 text-2xl font-black ${controller.theme.text}`}>{value}</Text>
    </Wrapper>
  );
}

function MiniMetric({ controller, color, label, onPress, value }) {
  return (
    <Pressable onPress={onPress} style={tw`flex-1 items-center p-4 ${controller.theme.card} rounded-3xl shadow-sm border ${controller.theme.border}`}>
      <View style={[tw`w-3 h-3 rounded-full`, { backgroundColor: color }]} />
      <Text style={tw`mt-2 text-2xl font-black ${controller.theme.text}`}>{value}</Text>
      <Text style={tw`text-xs font-bold ${controller.theme.muted}`}>{label}</Text>
    </Pressable>
  );
}

function StatusRow({ controller, count, onPress, percent, status }) {
  const meta = statusMeta[status];
  const Icon = meta.icon;

  return (
    <Pressable onPress={onPress} style={tw`p-4 mb-3 ${controller.theme.cardAlt} rounded-3xl`}>
      <View style={tw`flex-row items-center`}>
        <View style={tw`w-12 h-12 items-center justify-center rounded-2xl ${meta.bg}`}>
          <Icon size={20} color={meta.color} />
        </View>
        <View style={tw`ml-3 flex-1`}>
          <Text style={tw`font-black ${controller.theme.text}`}>{status}</Text>
          <View style={tw`h-2 mt-2 overflow-hidden rounded-full ${controller.themeMode === "dark" ? "bg-[#3a3a3a]" : "bg-[#eef0f4]"}`}>
            <View style={[tw`h-2 rounded-full`, { width: `${percent}%`, backgroundColor: meta.color }]} />
          </View>
        </View>
        <View style={tw`items-end ml-3`}>
          <Text style={tw`text-xl font-black ${controller.theme.text}`}>{count}</Text>
          <Text style={tw`text-xs font-bold ${controller.theme.muted}`}>{percent}%</Text>
        </View>
      </View>
    </Pressable>
  );
}
