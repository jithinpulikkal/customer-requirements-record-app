import { CloudUpload, Download, FileSpreadsheet, FileText, Share } from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import tw from "twrnc";
import Header from "../components/Header";

export default function ExportView({ controller }) {
  return (
    <View style={tw`flex-1 ${controller.theme.page}`}>
      <Header controller={controller} title="Export" />
      <ScrollView contentContainerStyle={tw`px-5 pb-44`}>
        <View style={tw`p-5 ${controller.theme.card} rounded-[32px] border ${controller.theme.border} shadow-sm`}>
          <View style={tw`w-16 h-16 items-center justify-center rounded-3xl ${controller.theme.cardAlt}`}>
            <Share size={28} color={controller.theme.accentColor} />
          </View>
          <Text style={tw`mt-5 text-3xl font-black ${controller.theme.text}`}>Backup and reports</Text>
          <Text style={tw`mt-2 leading-6 ${controller.theme.muted}`}>
            Export your local customer records as Excel sheets or professional PDF reports, then share or upload them to Google Drive.
          </Text>
        </View>

        <View style={tw`mt-4 gap-3`}>
          <ExportCard
            controller={controller}
            description="Create a spreadsheet with every saved entry and all form fields."
            icon={FileSpreadsheet}
            loading={controller.exporting}
            onPress={controller.exportEntries}
            title="Export Excel Sheet"
          />
          <ExportCard
            controller={controller}
            description="Create a printable report with business details, summary, status breakdown, and entries."
            icon={FileText}
            loading={controller.exportingPdf}
            onPress={controller.exportPdfReport}
            title="Export PDF Report"
          />
          <ExportCard
            controller={controller}
            description="Open the phone share sheet with the exported Excel file and choose Google Drive."
            icon={CloudUpload}
            loading={controller.exporting}
            onPress={controller.uploadToGoogleDrive}
            title="Upload to Google Drive"
            accent
          />
        </View>

        <View style={tw`p-5 mt-4 ${controller.theme.cardAlt} rounded-3xl`}>
          <Text style={tw`text-lg font-black ${controller.theme.text}`}>Export summary</Text>
          <View style={tw`flex-row gap-3 mt-4`}>
            <SummaryPill controller={controller} label="Entries" value={controller.stats.total} />
            <SummaryPill controller={controller} label="Running" value={controller.stats.running} />
            <SummaryPill controller={controller} label="Done" value={controller.stats.completed} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function ExportCard({ accent = false, controller, description, icon: Icon, loading, onPress, title }) {
  return (
    <Pressable
      onPress={onPress}
      style={tw`p-5 ${controller.theme.card} rounded-3xl border ${controller.theme.border} shadow-sm`}
    >
      <View style={tw`flex-row items-start`}>
        <View style={tw`w-13 h-13 items-center justify-center rounded-2xl ${accent ? controller.theme.accentBg : controller.theme.cardAlt}`}>
          <Icon size={23} color={controller.theme.accentColor} />
        </View>
        <View style={tw`ml-4 flex-1`}>
          <Text style={tw`text-lg font-black ${controller.theme.text}`}>{loading ? "Preparing..." : title}</Text>
          <Text style={tw`mt-1 leading-5 ${controller.theme.muted}`}>{description}</Text>
        </View>
        <Download size={19} color={controller.themeMode === "dark" ? "#f4f1ea" : "#20252d"} />
      </View>
    </Pressable>
  );
}

function SummaryPill({ controller, label, value }) {
  return (
    <View style={tw`flex-1 p-3 rounded-2xl ${controller.theme.card}`}>
      <Text style={tw`text-xs font-black ${controller.theme.muted}`}>{label}</Text>
      <Text style={tw`mt-1 text-2xl font-black ${controller.theme.text}`}>{value}</Text>
    </View>
  );
}
