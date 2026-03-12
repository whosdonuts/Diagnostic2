import { Pressable, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

interface OnboardingOptionButtonProps {
  label: string;
  subtitle?: string;
  selected?: boolean;
  isLast?: boolean;
  onPress: () => void;
}

export function OnboardingOptionButton({
  label,
  subtitle,
  selected = false,
  isLast = false,
  onPress,
}: OnboardingOptionButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={() => {
          scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 12, stiffness: 250 });
        }}
        onPress={onPress}
      >
        <View
          className={`flex-row justify-between items-center w-full px-5 py-4 ${
            !isLast ? "border-b border-forest-200" : ""
          } ${selected ? "bg-accent/10" : "bg-white/60"}`}
          style={{ direction: 'ltr' }}
        >
          <View className="flex-1 mr-3">
            <Text
              className={`text-base font-semibold text-left ${
                selected ? "text-accent" : "text-primary"
              }`}
            >
              {label}
            </Text>
            {subtitle ? (
              <Text className="text-xs text-forest-600 mt-0.5">
                {subtitle}
              </Text>
            ) : null}
          </View>

          {selected ? (
            <View className="w-6 h-6 rounded-full bg-accent items-center justify-center">
              <Text className="text-white text-xs font-bold">✓</Text>
            </View>
          ) : (
            <View className="w-6 h-6 rounded-full border-2 border-forest-200" />
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default OnboardingOptionButton;
