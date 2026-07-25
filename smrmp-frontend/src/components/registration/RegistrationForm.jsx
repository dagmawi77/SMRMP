import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Alert from '../ui/Alert';
import FormSection from './FormSection';
import PasswordStrengthMeter from './PasswordStrengthMeter';
import { useRegistrationUi } from '../../context/RegistrationUiContext';
import {
  buildRegistrationRules,
  GENDER_OPTIONS,
  NATIONALITY_OPTIONS,
  registerVisitor,
} from '../../utils/registrationValidation';

export default function RegistrationForm({ onSuccess }) {
  const { t } = useRegistrationUi();
  const rules = buildRegistrationRules(t);

  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      gender: '',
      dateOfBirth: '',
      nationality: '',
      nationalId: '',
      email: '',
      mobilePhone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const handleNextStep = async () => {
    setSubmitError(null);

    if (currentStep === 1) {
      const isStep1Valid = await trigger([
        'firstName',
        'lastName',
        'gender',
        'dateOfBirth',
        'nationality',
        'nationalId',
      ]);
      if (isStep1Valid) {
        setCurrentStep(2);
      }
    }
  };

  const handlePrevStep = () => {
    setSubmitError(null);
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleStepClick = async (targetStep) => {
    if (targetStep < currentStep) {
      setSubmitError(null);
      setCurrentStep(targetStep);
    } else if (targetStep > currentStep) {
      await handleNextStep();
    }
  };

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      setSubmitError({
        variant: 'error',
        title: t.errors.passwordMatch,
        message: t.errors.passwordMatch,
      });
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await registerVisitor(data);
      toast.success(t.success.title);
      onSuccess(`${data.firstName} ${data.lastName}`.trim());
    } catch (error) {
      let alert = {
        variant: 'error',
        title: 'Error',
        message: error.message || t.errors.server,
      };
      switch (error.code) {
        case 'DUPLICATE_EMAIL':
          alert = { variant: 'error', title: t.errors.duplicateEmail, message: t.errors.duplicateEmail };
          break;
        case 'NETWORK':
          alert = { variant: 'error', title: t.errors.network, message: t.errors.network };
          break;
        case 'SERVER':
          alert = { variant: 'error', title: t.errors.server, message: t.errors.server };
          break;
        default:
          break;
      }
      setSubmitError(alert);
      toast.error(alert.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (currentStep === 1) {
      handleNextStep();
    } else {
      handleSubmit(onSubmit)(e);
    }
  };

  const stepsInfo = [
    { step: 1, title: t.sections.personal },
    { step: 2, title: t.sections.contact },
  ];

  return (
    <form noValidate onSubmit={handleFormSubmit} className="space-y-6">
      {/* Stepper Header */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-center text-xs font-semibold">
          {stepsInfo.map((item) => {
            const isDone = currentStep > item.step;
            const isActive = currentStep === item.step;
            return (
              <button
                key={item.step}
                type="button"
                onClick={() => handleStepClick(item.step)}
                disabled={!isDone && currentStep < item.step}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 transition-all ${
                  isActive
                    ? 'border-smrmp-gold bg-smrmp-gold/20 text-smrmp-gold font-bold shadow-sm'
                    : isDone
                    ? 'border-smrmp-gold/40 bg-black/40 text-smrmp-parchment hover:border-smrmp-gold'
                    : 'border-white/10 bg-black/20 text-smrmp-parchment/40 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                      isDone || isActive
                        ? 'bg-smrmp-gold text-black'
                        : 'bg-white/10 text-smrmp-parchment/60'
                    }`}
                  >
                    {isDone ? <CheckIcon className="h-3 w-3 stroke-[3]" /> : item.step}
                  </span>
                  <span className="hidden sm:inline font-bold uppercase tracking-wider text-[10px]">
                    Step {item.step}
                  </span>
                </div>
                <span className="truncate text-[11px] leading-tight font-medium">
                  {item.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Progress Bar */}
        <div className="relative h-2 overflow-hidden rounded-full border border-white/10 bg-black/40">
          <div
            className="h-full bg-smrmp-gold transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / 2) * 100}%` }}
          />
        </div>
      </div>

      {submitError && (
        <Alert variant={submitError.variant} title={submitError.title}>
          <div className="flex gap-2">
            <ExclamationTriangleIcon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <span>{submitError.message}</span>
          </div>
        </Alert>
      )}

      {/* STEP 1: Personal Information */}
      {currentStep === 1 && (
        <FormSection number={1} title={t.sections.personal} id="section-personal">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              variant="glass"
              label={`${t.fields.firstName} *`}
              placeholder="First name"
              error={errors.firstName?.message}
              {...register('firstName', rules.firstName)}
            />
            <Input
              variant="glass"
              label={`${t.fields.lastName} *`}
              placeholder="Last name"
              error={errors.lastName?.message}
              {...register('lastName', rules.lastName)}
            />
            <Select
              variant="glass"
              label={t.fields.gender}
              required
              options={GENDER_OPTIONS}
              error={errors.gender?.message}
              placeholder="Select gender"
              value={watch('gender')}
              {...register('gender', rules.gender)}
            />
            <Input
              variant="glass"
              label={`${t.fields.dateOfBirth} *`}
              type="date"
              error={errors.dateOfBirth?.message}
              {...register('dateOfBirth', rules.dateOfBirth)}
            />
            <Select
              variant="glass"
              label={t.fields.nationality}
              required
              options={NATIONALITY_OPTIONS}
              error={errors.nationality?.message}
              placeholder="Select nationality"
              value={watch('nationality')}
              {...register('nationality', rules.nationality)}
            />
            <Input
              variant="glass"
              label={`${t.fields.nationalId} *`}
              placeholder="National ID or passport number"
              error={errors.nationalId?.message}
              {...register('nationalId', rules.nationalId)}
            />
          </div>
        </FormSection>
      )}

      {/* STEP 2: Contact Information + Password */}
      {currentStep === 2 && (
        <FormSection number={2} title={t.sections.contact} id="section-contact">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              variant="glass"
              label={`${t.fields.email} *`}
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              error={errors.email?.message}
              {...register('email', rules.email)}
            />
            <Input
              variant="glass"
              label={`${t.fields.mobilePhone} *`}
              type="tel"
              autoComplete="tel"
              placeholder="+251 9XX XXX XXXX"
              error={errors.mobilePhone?.message}
              {...register('mobilePhone', rules.mobilePhone)}
            />
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-smrmp-parchment/80">
                  {t.fields.password} *
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="flex items-center gap-1 text-xs font-semibold text-smrmp-gold hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-smrmp-gold"
                >
                  {showPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Create a password"
                className={`h-12 w-full rounded-xl border px-4 text-sm text-[#121212] bg-white outline-none transition-all placeholder:text-stone-400 [color-scheme:light] ${
                  errors.password
                    ? 'border-rose-400 bg-rose-50/90 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/25'
                    : 'border-white/20 hover:border-smrmp-gold/50 focus:border-smrmp-gold focus:ring-2 focus:ring-smrmp-gold/25'
                }`}
                {...register('password', rules.password)}
              />
              {errors.password && (
                <p className="mt-1.5 text-xs font-semibold text-rose-400">{errors.password.message}</p>
              )}
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="confirmPassword" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-smrmp-parchment/80">
                  {t.fields.confirmPassword} *
                </label>
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="flex items-center gap-1 text-xs font-semibold text-smrmp-gold hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-smrmp-gold"
                >
                  {showConfirm ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  {showConfirm ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Confirm your password"
                className={`h-12 w-full rounded-xl border px-4 text-sm text-[#121212] bg-white outline-none transition-all placeholder:text-stone-400 [color-scheme:light] ${
                  errors.confirmPassword
                    ? 'border-rose-400 bg-rose-50/90 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/25'
                    : 'border-white/20 hover:border-smrmp-gold/50 focus:border-smrmp-gold focus:ring-2 focus:ring-smrmp-gold/25'
                }`}
                {...register('confirmPassword', {
                  ...rules.confirmPassword,
                  validate: (v) => v === password || t.errors.passwordMatch,
                })}
              />
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs font-semibold text-rose-400">{errors.confirmPassword.message}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <p className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-smrmp-parchment/80">
                {t.passwordRequirements.title}
              </p>
              <PasswordStrengthMeter password={password} t={t} />
            </div>
          </div>
        </FormSection>
      )}

      {/* Form Action Controls */}
      <div className="flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={handlePrevStep}
            className="flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-white/25 px-6 text-xs font-bold uppercase tracking-widest text-smrmp-parchment transition-colors duration-500 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-smrmp-gold"
          >
            <ArrowLeftIcon className="h-4 w-4 shrink-0" />
            <span>{t.buttons.back}</span>
          </button>
        ) : (
          <Link
            to="/login"
            className="text-center text-xs font-semibold text-smrmp-gold transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-smrmp-gold"
          >
            {t.buttons.login}
          </Link>
        )}

        {currentStep < 2 ? (
          <button
            type="button"
            onClick={handleNextStep}
            className="group flex h-12 w-full sm:w-auto sm:min-w-[180px] items-center justify-center gap-3 rounded-xl bg-smrmp-gold px-6 text-xs font-bold uppercase tracking-widest text-black transition-colors duration-500 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-smrmp-gold"
          >
            <span>{t.buttons.next}</span>
            <ArrowRightIcon className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting}
            className="group flex h-12 w-full sm:w-auto sm:min-w-[200px] items-center justify-center gap-3 rounded-xl bg-smrmp-gold px-6 text-xs font-bold uppercase tracking-widest text-black transition-colors duration-500 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-smrmp-gold disabled:cursor-wait disabled:opacity-70"
          >
            <span>{isSubmitting ? t.buttons.creating : t.buttons.create}</span>
            <ArrowRightIcon className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        )}
      </div>
    </form>
  );
}
