import { useState, useCallback } from "react";
import {
  View,
  Text,
  useWindowDimensions,
  Pressable,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  SlideInRight,
  SlideOutLeft,
  SlideInLeft,
  SlideOutRight,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { UniversalLiquidCard } from "../components/UniversalLiquidCard";
import { OnboardingOptionButton } from "../components/OnboardingOptionButton";
import { LogoBreathing } from "../components/LogoBreathing";
import {
  usePatientStore,
  type BiologicalSex,
} from "../store/patientStore";

/* ───────────── Step Definitions ───────────── */

interface StepOption {
  label: string;
  subtitle?: string;
  value: string | number;
}

interface StepDef {
  key: "age" | "sex" | "language" | "ethnicity";
  question: string;
  description: string;
  options: StepOption[];
  multiSelect?: boolean;
}

const STEPS: StepDef[] = [
  {
    key: "age",
    question: "What's your age range?",
    description: "This helps us calibrate biometric baselines to your cohort.",
    options: [
      { label: "18 – 24", value: 21 },
      { label: "25 – 34", value: 30 },
      { label: "35 – 44", value: 40 },
      { label: "45 – 54", value: 50 },
      { label: "55+", value: 60 },
    ],
  },
  {
    key: "sex",
    question: "Biological sex at birth?",
    description:
      "Physiological baselines differ by sex. This is never shared externally.",
    options: [
      { label: "Female", value: "female" },
      { label: "Male", value: "male" },
      { label: "Intersex", value: "intersex" },
      { label: "Prefer not to say", value: "prefer_not_to_say" },
    ],
  },
  {
    key: "language",
    question: "Primary language?",
    description:
      "We'll match you with clinicians and resources in your language.",
    options: [
      { label: "English", value: "en" },
      { label: "Français", value: "fr" },
      { label: "Español", value: "es" },
      { label: "العربية", value: "ar" },
      { label: "中文", value: "zh" },
      { label: "Other", value: "other" },
    ],
  },
  {
    key: "ethnicity",
    question: "Choose your ethnicity",
    description: "Select all that apply.",
    multiSelect: true,
    options: [
      { label: "White", value: "white" },
      { label: "Black / African American", value: "black_african_american" },
      { label: "Black / Caribbean", value: "black_caribbean" },
      { label: "Black / African", value: "black_african" },
      { label: "East Asian", value: "east_asian" },
      { label: "South Asian", value: "south_asian" },
      { label: "Southeast Asian", value: "southeast_asian" },
      { label: "Hispanic / Latino", value: "hispanic_latino" },
      { label: "Middle Eastern / North African", value: "mena" },
      { label: "Indigenous / First Nations", value: "indigenous" },
      { label: "Pacific Islander", value: "pacific_islander" },
      { label: "Other", value: "other" },
      { label: "Prefer not to say", value: "prefer_not_to_say" },
    ],
  },
];

/* ───────────── Spring config ───────────── */
const CARD_SPRING = { damping: 20, stiffness: 200, mass: 1 };

type SelectionValue = string | number | (string | number)[];
type Selections = Record<string, SelectionValue>;

/* ───────────── Component ───────────── */

export default function OnboardingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { setAge, setSex, setLanguage, setEthnicity, completeDemographics } =
    usePatientStore();

  const [stepIndex, setStepIndex] = useState(0);
  const [selections, setSelections] = useState<Selections>({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);

  const step = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;
  const progress = (stepIndex + 1) / STEPS.length;

  const currentSelection: SelectionValue | null =
    selections[step.key] ?? (step.multiSelect ? [] : null);

  const hasSelection = step.multiSelect
    ? Array.isArray(currentSelection) && currentSelection.length > 0
    : currentSelection != null;

  const isOptionSelected = useCallback(
    (value: string | number): boolean => {
      if (step.multiSelect) {
        return (
          Array.isArray(currentSelection) &&
          (currentSelection as (string | number)[]).includes(value)
        );
      }
      return currentSelection === value;
    },
    [step.multiSelect, currentSelection],
  );

  const handleSelect = useCallback(
    (value: string | number) => {
      if (isTransitioning) return;

      if (step.multiSelect) {
        setSelections((prev) => {
          const arr = Array.isArray(prev[step.key])
            ? [...(prev[step.key] as (string | number)[])]
            : [];

          if (value === "prefer_not_to_say") {
            return { ...prev, [step.key]: ["prefer_not_to_say"] };
          }

          const filtered = arr.filter((v) => v !== "prefer_not_to_say");
          const idx = filtered.indexOf(value);
          if (idx >= 0) {
            filtered.splice(idx, 1);
          } else {
            filtered.push(value);
          }
          return { ...prev, [step.key]: filtered };
        });
      } else {
        setSelections((prev) => ({ ...prev, [step.key]: value }));
      }
    },
    [isTransitioning, step.key, step.multiSelect],
  );

  const commitStep = useCallback(
    (stepKey: string, value: SelectionValue) => {
      switch (stepKey) {
        case "age":
          setAge(value as number);
          break;
        case "sex":
          setSex(value as BiologicalSex);
          break;
        case "language":
          setLanguage(value as string);
          break;
        case "ethnicity":
          setEthnicity(value as string[]);
          break;
      }
    },
    [setAge, setSex, setLanguage, setEthnicity],
  );

  const handleBack = useCallback(() => {
    if (stepIndex === 0 || isTransitioning) return;
    setDirection(-1);
    setIsTransitioning(true);
    setTimeout(() => {
      setStepIndex((i) => i - 1);
      setIsTransitioning(false);
    }, 350);
  }, [stepIndex, isTransitioning]);

  const handleNext = useCallback(() => {
    if (!hasSelection || isTransitioning) return;

    const value = selections[step.key];
    commitStep(step.key, value);
    setDirection(1);
    setIsTransitioning(true);

    if (isLastStep) {
      completeDemographics();
      setTimeout(() => {
        router.replace("/(tabs)/scanner");
      }, 400);
    } else {
      setTimeout(() => {
        setStepIndex((i) => i + 1);
        setIsTransitioning(false);
      }, 350);
    }
  }, [
    hasSelection,
    isTransitioning,
    isLastStep,
    selections,
    step.key,
    commitStep,
    completeDemographics,
    router,
  ]);

  const entering =
    direction === 1
      ? SlideInRight.springify()
          .damping(CARD_SPRING.damping)
          .stiffness(CARD_SPRING.stiffness)
          .mass(CARD_SPRING.mass)
      : SlideInLeft.springify()
          .damping(CARD_SPRING.damping)
          .stiffness(CARD_SPRING.stiffness)
          .mass(CARD_SPRING.mass);

  const exiting =
    direction === 1
      ? SlideOutLeft.springify()
          .damping(CARD_SPRING.damping)
          .stiffness(CARD_SPRING.stiffness)
          .mass(CARD_SPRING.mass)
      : SlideOutRight.springify()
          .damping(CARD_SPRING.damping)
          .stiffness(CARD_SPRING.stiffness)
          .mass(CARD_SPRING.mass);

  const optionsList = step.options.map((opt, idx) => (
    <OnboardingOptionButton
      key={String(opt.value)}
      label={opt.label}
      subtitle={opt.subtitle}
      selected={isOptionSelected(opt.value)}
      isLast={idx === step.options.length - 1}
      onPress={() => handleSelect(opt.value)}
    />
  ));

  return (
    <View className="flex-1 bg-white">
      {/* Background mesh */}
      <View className="absolute w-[450px] h-[450px] rounded-full bg-forest-100 opacity-30 blur-3xl -top-32 -right-16" />
      <View className="absolute w-[350px] h-[350px] rounded-full bg-forest-200 opacity-20 blur-3xl bottom-20 -left-20" />

      {/* Watermark logo */}
      <LogoBreathing watermark size={width * 0.6} style={{ bottom: "5%", right: "-10%" }} />

      {/* Top bar: Back button + step indicator */}
      <View className="flex-row items-center justify-between px-6 pt-16 pb-2">
        {stepIndex > 0 ? (
          <Pressable
            onPress={handleBack}
            className="flex-row items-center py-2 pr-4"
          >
            <Ionicons name="chevron-back" size={20} color="#166534" />
            <Text className="text-sm font-semibold text-primary ml-1">
              Back
            </Text>
          </Pressable>
        ) : (
          <View className="w-16" />
        )}
        <Text className="text-xs text-forest-500">
          Step {stepIndex + 1} of {STEPS.length}
        </Text>
      </View>

      {/* Progress bar */}
      <View className="px-6 pb-4">
        <View className="h-1.5 rounded-full bg-forest-50 overflow-hidden">
          <Animated.View
            className="h-full rounded-full bg-accent"
            style={{ width: `${progress * 100}%` }}
          />
        </View>
      </View>

      {/* Card area */}
      <View className="flex-1 w-full items-center">
        <Animated.View
          key={step.key}
          entering={entering}
          exiting={exiting}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            alignItems: 'center',
          }}
        >
          {/* Master width-lock + vertical anchor */}
          <View className="w-[90%] max-w-[400px] mt-16">
            {/* Top Card: Question & Description */}
            <UniversalLiquidCard
              variant="elevated"
              className="w-full border border-green-200 rounded-3xl overflow-hidden"
              style={{ borderColor: '#BBF7D0' }}
            >
              <View className="w-full justify-center items-center py-8 px-4">
                <Text className="text-2xl font-bold text-primary mb-2 text-center">
                  {step.question}
                </Text>
                <Text className="text-sm text-forest-600 leading-5 text-center">
                  {step.description}
                </Text>
              </View>
            </UniversalLiquidCard>

            {/* Bottom Card: Options List */}
            <UniversalLiquidCard
              variant="elevated"
              className="w-full border border-green-200 rounded-3xl overflow-hidden p-0"
              style={{ borderColor: '#BBF7D0', marginTop: 24 }}
            >
              {step.multiSelect ? (
                <ScrollView
                  className="w-full"
                  style={{ maxHeight: 320 }}
                  showsVerticalScrollIndicator={true}
                  bounces={false}
                >
                  {optionsList}
                </ScrollView>
              ) : (
                optionsList
              )}
            </UniversalLiquidCard>
          </View>
        </Animated.View>
      </View>

      {/* Action button */}
      <View className="w-[90%] max-w-[400px] self-center pb-10">
        <Pressable
          onPress={handleNext}
          disabled={!hasSelection}
          className={`w-full h-14 rounded-2xl items-center justify-center ${
            hasSelection ? "bg-accent" : "bg-forest-100"
          }`}
        >
          <Text
            className={`text-lg font-bold ${
              hasSelection ? "text-white" : "text-forest-300"
            }`}
          >
            {isLastStep ? "Confirm" : "Continue"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
