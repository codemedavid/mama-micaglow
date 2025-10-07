import type { Metadata } from 'next';
import { SignUp } from '@clerk/nextjs';
import { ArrowLeft, Package, Shield, Star, Users } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getI18nPath } from '@/utils/Helpers';

type ISignUpPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: ISignUpPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'SignUp',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function SignUpPage(props: ISignUpPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 via-white to-purple-50">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 animate-pulse rounded-full bg-purple-200 opacity-70 mix-blend-multiply blur-xl filter"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 animate-pulse rounded-full bg-blue-200 opacity-70 mix-blend-multiply blur-xl filter" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-40 left-1/2 h-80 w-80 animate-pulse rounded-full bg-pink-200 opacity-70 mix-blend-multiply blur-xl filter" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Header */}
      <div className="relative z-10">
        <div className="container px-4 py-4 sm:px-6 sm:py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="group flex items-center space-x-2 sm:space-x-3">
              <div className="gradient-purple flex h-8 w-8 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 sm:h-10 sm:w-10 sm:rounded-2xl">
                <Package className="h-4 w-4 text-white sm:h-6 sm:w-6" />
              </div>
              <span className="gradient-text-purple text-lg font-bold sm:text-2xl">
                Mama_MicaGlow
              </span>
            </Link>
            <Button variant="ghost" asChild className="backdrop-blur-sm hover:bg-white/50" size="sm">
              <Link href="/" className="flex items-center space-x-1 sm:space-x-2">
                <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sm:hidden">Back</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-[calc(100vh-80px)] items-start justify-center px-4 py-4 sm:items-center sm:py-8 lg:py-12">
        <div className="w-full">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-4 sm:gap-6 lg:grid-cols-5 lg:gap-12">
            {/* Left Side - Branding */}
            <div className="hidden lg:col-span-2 lg:block">
              <div className="max-w-md">
                <div className="mb-8 inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-xl">
                  <Package className="h-12 w-12 text-white" />
                </div>
                <h1 className="mb-6 text-5xl font-bold text-gray-900">
                  Join Mama_MicaGlow Today
                </h1>
                <p className="mb-8 text-xl leading-relaxed text-gray-600">
                  Create your account and start enjoying premium peptides with exclusive group buy discounts and regional community access.
                </p>

                {/* Benefits Grid */}
                <div className="grid grid-cols-1 gap-6">
                  <div className="flex items-center space-x-4 rounded-2xl border border-white/20 bg-white/60 p-6 shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-200">
                      <Star className="h-7 w-7 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Exclusive Benefits</h3>
                      <p className="text-gray-600">Access to group buys and sub-group discounts</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 rounded-2xl border border-white/20 bg-white/60 p-6 shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-200">
                      <Users className="h-7 w-7 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Community Access</h3>
                      <p className="text-gray-600">Connect with regional peptide communities</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 rounded-2xl border border-white/20 bg-white/60 p-6 shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-purple-200">
                      <Shield className="h-7 w-7 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Secure & Fast</h3>
                      <p className="text-gray-600">Quick setup with enterprise-grade security</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="mx-auto w-full max-w-sm sm:max-w-md lg:col-span-3 lg:max-w-lg">
              {/* Mobile Welcome Section */}
              <div className="mb-4 text-center sm:mb-6 lg:hidden">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg sm:mb-4 sm:h-12 sm:w-12 sm:rounded-2xl">
                  <Package className="h-5 w-5 text-white sm:h-6 sm:w-6" />
                </div>
                <h1 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl">
                  Join our community
                </h1>
                <p className="px-2 text-xs leading-relaxed text-gray-600 sm:text-sm">
                  Create your account and start enjoying premium peptides with exclusive group buy discounts and regional community access.
                </p>
              </div>

              {/* Sign Up Form */}
              <div className="rounded-xl border border-white/20 bg-white/80 p-3 shadow-2xl backdrop-blur-xl sm:rounded-2xl sm:p-4 lg:rounded-3xl lg:p-6">
                <div className="mb-4 text-center sm:mb-6">
                  <h2 className="mb-1 text-lg font-bold text-gray-900 sm:text-xl">Create your account</h2>
                  <p className="text-xs text-gray-600 sm:text-sm">Join our community and start your peptide journey today</p>
                </div>

                <SignUp
                  path={getI18nPath('/sign-up', locale)}
                  appearance={{
                    elements: {
                      formButtonPrimary: 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-2.5 px-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-xs w-full sm:py-3 sm:px-4 sm:rounded-lg sm:text-sm',
                      card: 'shadow-none border-0 bg-transparent max-h-none overflow-visible w-full',
                      headerTitle: 'hidden',
                      headerSubtitle: 'hidden',
                      socialButtonsBlockButton: 'border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 rounded-lg py-2 font-medium text-xs w-full sm:py-2.5 sm:text-sm',
                      formFieldInput: 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 rounded-lg py-2 px-3 transition-all duration-200 text-xs bg-white/50 backdrop-blur-sm sm:py-2.5 sm:px-3 sm:text-sm',
                      footerActionLink: 'text-purple-600 hover:text-purple-700 font-semibold transition-colors duration-200 text-xs',
                      formFieldLabel: 'text-gray-700 font-semibold text-xs mb-1',
                      identityPreviewText: 'text-gray-600 text-xs',
                      formFieldSuccessText: 'text-purple-600 text-xs',
                      formFieldErrorText: 'text-red-600 text-xs',
                      footerActionText: 'text-gray-600 text-xs',
                      formResendCodeLink: 'text-purple-600 hover:text-purple-700 font-semibold transition-colors duration-200 text-xs',
                      otpCodeFieldInput: 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 rounded-lg py-2 px-3 text-xs bg-white/50 backdrop-blur-sm',
                      formFieldInputShowPasswordButton: 'text-gray-400 hover:text-gray-600 transition-colors duration-200',
                      formFieldInputShowPasswordIcon: 'text-gray-400',
                      formFieldInputHidePasswordButton: 'text-gray-400 hover:text-gray-600 transition-colors duration-200',
                      formFieldInputHidePasswordIcon: 'text-gray-400',
                      formHeaderTitle: 'text-base font-bold text-gray-900 sm:text-lg',
                      formHeaderSubtitle: 'text-xs text-gray-600 sm:text-sm',
                      formFieldRow: 'mb-3 sm:mb-4',
                      socialButtonsBlockButtonText: 'text-xs sm:text-sm',
                      socialButtonsBlockButtonIcon: 'w-3 h-3 sm:w-4 sm:h-4',
                      footer: 'mt-3 sm:mt-4',
                      footerAction: 'text-xs',
                      dividerLine: 'bg-gray-200',
                      dividerText: 'text-gray-500 text-xs',
                      socialButtonsBlockButton__apple: 'bg-black text-white hover:bg-gray-800',
                      socialButtonsBlockButton__google: 'bg-white text-gray-900 hover:bg-gray-50',
                      socialButtonsBlockButton__facebook: 'bg-blue-600 text-white hover:bg-blue-700',
                      formFieldRow__emailAddress: 'mb-3',
                      formFieldRow__password: 'mb-3',
                      formFieldRow__firstName: 'mb-3',
                      formFieldRow__lastName: 'mb-3',
                      formButtonPrimary__loading: 'opacity-70 cursor-not-allowed',
                      formFieldInputShowPasswordButton__password: 'text-gray-400 hover:text-gray-600',
                      formFieldInputShowPasswordButton__confirmPassword: 'text-gray-400 hover:text-gray-600',
                    },
                  }}
                />
              </div>

              {/* Footer */}
              <div className="mt-4 text-center sm:mt-6">
                <p className="text-xs text-gray-600 sm:text-sm">
                  Already have an account?
                  {' '}
                  <Link href="/sign-in" className="font-semibold text-purple-600 transition-colors duration-200 hover:text-purple-700 hover:underline">
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
