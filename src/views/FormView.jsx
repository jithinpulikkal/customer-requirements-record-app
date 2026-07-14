import { CalendarClock, ClipboardList, Save, X } from "lucide-react-native";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import tw from "twrnc";
import DatePickerField from "../components/DatePickerField";
import DropdownField from "../components/DropdownField";
import Header from "../components/Header";
import { statuses } from "../constants/appConstants";

export default function FormView({ controller }) {
  const placeholderColor = controller.themeMode === "dark" ? "#777d90" : "#8d96a3";
  const readOnlyStyle = tw`px-4 min-h-13 text-base border rounded-2xl ${controller.theme.input} ${controller.theme.inputMuted}`;
  const inputStyle = tw`px-4 min-h-13 text-base border rounded-2xl ${controller.theme.input}`;
  const iconBg = controller.themeMode === "dark" ? "bg-[#303030]" : "bg-[#fff2ef]";
  const helperColor = controller.themeMode === "dark" ? "#a9a49b" : "#7b8491";

  return (
    <View style={tw`flex-1 ${controller.theme.page}`}>
      <Header controller={controller} title={controller.form.name ? controller.form.name : "Customer Entry"} showBack />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={tw`flex-1`}>
        <ScrollView contentContainerStyle={tw`px-5 pb-24`}>
          <View style={tw`items-center pt-3 pb-5`}>
            <View style={tw`w-18 h-18 items-center justify-center rounded-3xl ${iconBg}`}>
              <ClipboardList size={34} color={controller.theme.accentColor} />
            </View>
            <Text style={tw`mt-4 text-2xl font-black ${controller.theme.text}`}>
              {controller.editing ? "Edit Entry" : "New Entry"}
            </Text>
            <Text style={tw`mt-1 text-center text-sm ${controller.theme.muted}`}>
              Save customer details, requirements, and delivery plans.
            </Text>
          </View>

          <View style={tw`p-4 ${controller.theme.card} rounded-3xl border ${controller.theme.border}`}>
            <View style={tw`gap-3`}>
              <ThemedField controller={controller} label="Date">
                <TextInput value={controller.form.date} editable={false} style={readOnlyStyle} />
              </ThemedField>
              
              <ThemedField controller={controller} label="SL No">
                <TextInput value={controller.form.slno} editable={false} style={readOnlyStyle} />
              </ThemedField>
              <ThemedField controller={controller} label="Name">
                <TextInput
                  value={controller.form.name}
                  onChangeText={(value) => controller.setField("name", value)}
                  placeholder="Customer name"
                  placeholderTextColor={placeholderColor}
                  style={inputStyle}
                />
              </ThemedField>
              <ThemedField controller={controller} label="Phone Number">
                <TextInput
                  value={controller.form.phone}
                  onChangeText={(value) => controller.setField("phone", value)}
                  placeholder="Customer phone number"
                  placeholderTextColor={placeholderColor}
                  keyboardType="phone-pad"
                  style={inputStyle}
                />
              </ThemedField>
              <ThemedField controller={controller} label="Detail 1">
                <TextInput
                  value={controller.form.detail1}
                  onChangeText={(value) => controller.setField("detail1", value)}
                  placeholder="Requirement detail"
                  placeholderTextColor={placeholderColor}
                  style={inputStyle}
                />
              </ThemedField>
              <ThemedField controller={controller} label="Detail 2">
                <TextInput
                  value={controller.form.detail2}
                  onChangeText={(value) => controller.setField("detail2", value)}
                  placeholder="Requirement detail"
                  placeholderTextColor={placeholderColor}
                  style={inputStyle}
                />
              </ThemedField>
              <ThemedField controller={controller} label="Detail 3">
                <TextInput
                  value={controller.form.detail3}
                  onChangeText={(value) => controller.setField("detail3", value)}
                  placeholder="Requirement detail"
                  placeholderTextColor={placeholderColor}
                  style={inputStyle}
                />
              </ThemedField>
              <ThemedField controller={controller} label="Type">
                <DropdownField
                  placeholder="Select type"
                  value={controller.form.type}
                  options={controller.types}
                  onChange={(value) => controller.setField("type", value)}
                  allowEmpty
                  variant={controller.themeMode}
                />
              </ThemedField>
              <ThemedField controller={controller} label="Insert New Type">
                <TextInput
                  placeholder="Optional new type"
                  placeholderTextColor={placeholderColor}
                  value={controller.newType}
                  onChangeText={controller.setNewType}
                  style={inputStyle}
                />
              </ThemedField>
              <ThemedField controller={controller} label="Status">
                <DropdownField
                  value={controller.form.status}
                  options={statuses}
                  onChange={(value) => controller.setField("status", value)}
                  variant={controller.themeMode}
                />
              </ThemedField>
              <ThemedField controller={controller} label="Estimated Delivery Date">
                <DatePickerField
                  placeholder="Select delivery date"
                  value={controller.form.estimateDeliveryDate}
                  onChange={(value) => controller.setField("estimateDeliveryDate", value)}
                  variant={controller.themeMode}
                />
              </ThemedField>
              <ThemedField controller={controller} label="Notes">
                <TextInput
                  multiline
                  value={controller.form.notes}
                  onChangeText={(value) => controller.setField("notes", value)}
                  placeholder="Add notes"
                  placeholderTextColor={placeholderColor}
                  style={[inputStyle, tw`min-h-28 py-4`]}
                  textAlignVertical="top"
                />
              </ThemedField>
            </View>
          </View>

          <View style={tw`mt-5 p-3 ${controller.theme.card} rounded-3xl border ${controller.theme.border}`}>
            <Pressable
              onPress={controller.saveEntry}
              style={tw`h-14 flex-row items-center justify-center rounded-2xl ${controller.theme.primary}`}
            >
              <Save size={18} color={controller.themeMode === "dark" ? "#171717" : "#ffffff"} />
              <Text style={tw`ml-2 font-black ${controller.theme.primaryText}`}>Save Entry</Text>
            </Pressable>
            <Pressable
              onPress={() => controller.setScreen(controller.selectedEntry ? "detail" : "list")}
              style={tw`h-12 mt-2 flex-row items-center justify-center rounded-2xl ${controller.theme.cardAlt}`}
            >
              <X size={17} color={controller.theme.iconMuted} />
              <Text style={tw`ml-2 font-black ${controller.theme.muted}`}>Cancel</Text>
            </Pressable>
          </View>

          <View style={tw`items-center mt-5`}>
            <View style={tw`flex-row items-center`}>
              <CalendarClock size={15} color={helperColor} />
              <Text style={tw`ml-2 text-xs font-bold ${controller.theme.muted}`}>
                Delivery estimate helps track upcoming work.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function ThemedField({ children, controller, label }) {
  return (
    <View>
      <Text style={tw`mb-2 text-xs font-black uppercase tracking-wide ${controller.theme.muted}`}>{label}</Text>
      {children}
    </View>
  );
}
