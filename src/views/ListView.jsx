import { ArrowUpRight, CalendarDays, CheckCircle2, ChevronDown, ChevronUp, ClipboardList, Clock3, Search, SlidersHorizontal } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import tw from "twrnc";
import DatePickerField from "../components/DatePickerField";
import DropdownField from "../components/DropdownField";
import Field from "../components/Field";
import Header from "../components/Header";
import { statusDots, statuses } from "../constants/appConstants";

const tileAccent = {
  "Newly Added": "bg-[#57a7ff]",
  "Currently Running": "bg-[#f3a712]",
  Completed: "bg-[#24a77e]",
  "On Hold": "bg-[#7467d6]",
  Cancelled: "bg-[#e54960]"
};

const tileBadge = {
  "Newly Added": "bg-[#f2f8ff]",
  "Currently Running": "bg-[#fff8e8]",
  Completed: "bg-[#effbf6]",
  "On Hold": "bg-[#f4f2ff]",
  Cancelled: "bg-[#fff1f3]"
};

export default function ListView({ controller }) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeFilters = [
    controller.filter.date,
    controller.filter.type,
    controller.filter.status
  ].filter(Boolean).length;

  return (
    <View style={tw`flex-1 ${controller.theme.page}`}>
      <Header controller={controller} title="Entries" />
      <ScrollView contentContainerStyle={tw`px-5 pb-44`}>
        <View style={tw`p-5 mb-4 ${controller.theme.card} rounded-[32px] shadow-sm border ${controller.theme.border}`}>
          <View style={tw`flex-row items-start justify-between`}>
            <View style={tw`flex-1 pr-4`}>
              <Text style={tw`text-xs font-black uppercase tracking-wide ${controller.theme.accentText}`}>
                Work queue
              </Text>
              <Text style={tw`mt-1 text-4xl font-black ${controller.theme.text}`}>
                {controller.visibleEntries.length}
              </Text>
              <Text style={tw`mt-1 text-sm font-bold ${controller.theme.muted}`}>
                visible customer entries
              </Text>
            </View>
            <View style={tw`w-16 h-16 items-center justify-center rounded-3xl ${controller.theme.cardAlt}`}>
              <ClipboardList size={28} color={controller.theme.accentColor} />
            </View>
          </View>

          <View style={tw`flex-row gap-3 mt-5`}>
            <StatPill controller={controller} icon={CalendarDays} label="Running" value={controller.stats.running} />
            <StatPill controller={controller} icon={CheckCircle2} label="Done" value={controller.stats.completed} />
            <StatPill controller={controller} icon={Clock3} label="On Hold" value={controller.stats.onHold} />
          </View>
        </View>

        <View style={tw`p-4 mb-4 ${controller.theme.card} rounded-3xl shadow-sm border ${controller.theme.border}`}>
          <Pressable
            onPress={() => setFiltersOpen((open) => !open)}
            style={tw`flex-row items-center`}
          >
            <SlidersHorizontal size={18} color={controller.themeMode === "dark" ? "#f4f1ea" : "#20252d"} />
            <Text style={tw`ml-2 flex-1 font-black ${controller.theme.text}`}>Filter and sort</Text>
            {activeFilters ? (
              <View style={tw`mr-3 px-3 py-1 rounded-full ${controller.theme.accentBg}`}>
                <Text style={tw`text-xs font-black ${controller.theme.accentText}`}>{activeFilters}</Text>
              </View>
            ) : null}
            {filtersOpen ? (
              <ChevronUp size={20} color={controller.themeMode === "dark" ? "#f4f1ea" : "#20252d"} />
            ) : (
              <ChevronDown size={20} color={controller.themeMode === "dark" ? "#f4f1ea" : "#20252d"} />
            )}
          </Pressable>

          {filtersOpen ? (
            <>
              <View style={tw`gap-3 mt-4`}>
                <Field label="Date" labelClass={controller.theme.muted}>
                  <DatePickerField
                    value={controller.filter.date}
                    onChange={(date) => controller.setFilter({ ...controller.filter, date })}
                    variant={controller.themeMode}
                  />
                </Field>
                <Field label="Type" labelClass={controller.theme.muted}>
                  <DropdownField
                    placeholder="All types"
                    value={controller.filter.type}
                    options={controller.types}
                    onChange={(type) => controller.setFilter({ ...controller.filter, type })}
                    allowEmpty
                    variant={controller.themeMode}
                  />
                </Field>
                <Field label="Status" labelClass={controller.theme.muted}>
                  <DropdownField
                    placeholder="All statuses"
                    value={controller.filter.status}
                    options={statuses}
                    onChange={(status) => controller.setFilter({ ...controller.filter, status })}
                    allowEmpty
                    variant={controller.themeMode}
                  />
                </Field>
              </View>

              <View style={tw`flex-row gap-2 mt-4`}>
                {["date", "slno", "type"].map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => controller.setSortBy(item)}
                    style={tw`flex-1 py-3 rounded-full ${
                      controller.sortBy === item ? controller.theme.primary : controller.theme.cardAlt
                    }`}
                  >
                    <Text
                      style={tw`text-center text-xs font-black ${
                        controller.sortBy === item ? controller.theme.primaryText : controller.theme.muted
                      }`}
                    >
                      {item.toUpperCase()}
                    </Text>
                  </Pressable>
                ))}
                <Pressable
                  onPress={() => controller.setSortDir(controller.sortDir === "asc" ? "desc" : "asc")}
                  style={tw`px-4 py-3 rounded-full ${controller.theme.accentBg}`}
                >
                  <Text style={tw`text-xs font-black ${controller.theme.accentText}`}>
                    {controller.sortDir === "asc" ? "ASC" : "DESC"}
                  </Text>
                </Pressable>
              </View>
            </>
          ) : null}
        </View>

        <View style={tw`flex-row items-center justify-between mb-3`}>
          <View style={tw`flex-row items-center`}>
            <Search size={18} color={controller.themeMode === "dark" ? "#f4f1ea" : "#20252d"} />
            <Text style={tw`ml-2 text-lg font-black ${controller.theme.text}`}>Entries</Text>
          </View>
          <Text style={tw`text-sm font-black ${controller.theme.muted}`}>
            Newest first
          </Text>
        </View>

        {controller.visibleEntries.length === 0 ? (
          <View style={tw`items-center p-8 ${controller.theme.card} rounded-3xl border border-dashed ${controller.theme.border}`}>
            <Text style={tw`text-center ${controller.theme.muted}`}>No entries found.</Text>
          </View>
        ) : (
          controller.visibleEntries.map((entry) => (
            <EntryCard
              controller={controller}
              key={entry.id}
              entry={entry}
              onPress={() => {
                controller.setSelectedId(entry.id);
                controller.setScreen("detail");
              }}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function StatPill({ controller, icon: Icon, label, value }) {
  return (
    <View style={tw`flex-1 p-3 ${controller.theme.cardAlt} rounded-2xl`}>
      <View style={tw`flex-row items-center`}>
        <Icon size={15} color={controller.theme.accentColor} />
        <Text style={tw`ml-1 text-xs font-black ${controller.theme.muted}`}>{label}</Text>
      </View>
      <Text style={tw`mt-2 text-2xl font-black ${controller.theme.text}`}>{value}</Text>
    </View>
  );
}

function EntryCard({ controller, entry, onPress }) {
  const dark = controller.themeMode === "dark";
  const statusColor = {
    "Newly Added": "#57a7ff",
    "Currently Running": "#f3a712",
    Completed: "#24a77e",
    "On Hold": "#7467d6",
    Cancelled: "#e54960"
  }[entry.status];

  return (
    <Pressable
      onPress={onPress}
      style={tw`relative overflow-hidden mb-3 ${controller.theme.card} border ${controller.theme.border} rounded-[30px] shadow-sm`}
    >
      <View style={tw`absolute left-0 top-0 bottom-0 w-1.5 ${tileAccent[entry.status]}`} />

      <View style={tw`p-4 pl-5`}>
        <View style={tw`flex-row items-start gap-3`}>
          <View style={tw`flex-1 pr-1`}>
            <View style={tw`flex-row flex-wrap items-center`}>
              <Text style={tw`text-[11px] font-black uppercase ${controller.theme.muted}`}>SL {entry.slno}</Text>
              <View style={tw`w-1 h-1 mx-2 rounded-full ${controller.theme.cardAlt}`} />
              <Text style={tw`text-[11px] font-bold ${controller.theme.muted}`}>{entry.date}</Text>
              {entry.estimateDeliveryDate ? (
                <>
                  <View style={tw`w-1 h-1 mx-2 rounded-full ${controller.theme.cardAlt}`} />
                  <Text style={tw`text-[11px] font-bold ${controller.theme.muted}`}>
                    Due {entry.estimateDeliveryDate}
                  </Text>
                </>
              ) : null}
            </View>

            <Text style={tw`mt-2 text-lg font-black ${controller.theme.text}`}>{entry.name}</Text>
            <Text numberOfLines={1} style={tw`mt-1 text-sm font-bold ${controller.theme.muted}`}>
              {entry.type || "No type"} {entry.detail1 ? `- ${entry.detail1}` : ""}
            </Text>
          </View>

          <View style={tw`items-center`}>
            <View style={tw`w-4 h-4 items-center justify-center rounded-3xl ${tileBadge[entry.status]}`}>
              <View style={tw`w-2.5 h-2.5 rounded-full ${statusDots[entry.status]}`} />
            </View>
            <View style={tw`mt-2 w-9 h-9 items-center justify-center rounded-full ${controller.theme.cardAlt}`}>
              <ArrowUpRight size={16} color={dark ? "#f4f1ea" : "#20252d"} />
            </View>
          </View>
        </View>

        <View style={tw`mt-4 flex-row items-center`}>
          <View style={tw`flex-1 h-2 overflow-hidden rounded-full ${dark ? "bg-[#3a3a3a]" : "bg-[#edf0f4]"}`}>
            <View style={[tw`h-2 rounded-full`, { width: statusProgress(entry.status), backgroundColor: statusColor }]} />
          </View>
          <View style={tw`ml-3 px-3 py-1.5 rounded-full ${controller.theme.cardAlt}`}>
            <Text style={tw`text-[10px] font-black ${controller.theme.text}`}>
              {entry.status}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function statusProgress(status) {
  const widths = {
    "Newly Added": "22%",
    "Currently Running": "55%",
    Completed: "100%",
    "On Hold": "42%",
    Cancelled: "28%"
  };
  return widths[status] || "35%";
}
