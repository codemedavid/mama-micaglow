import type { Metadata } from 'next';
import { SignIn } from '@clerk/nextjs';
import { ArrowLeft, Package, Shield, Users } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getI18nPath } from '@/utils/Helpers';

type ISignInPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: ISignInPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'SignIn',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function SignInPage(props: ISignInPageProps) {
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
        <div className="px-4 py-4 sm:px-6 sm:py-6">
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
      <div className="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="w-full">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-6 sm:gap-8 lg:grid-cols-5 lg:gap-12">
            {/* Left Side - Branding */}
            <div className="hidden lg:col-span-2 lg:block">
              <div className="max-w-md">
                <div className="mb-8 inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-xl">
                  <Package className="h-12 w-12 text-white" />
                </div>
                <h1 className="mb-6 text-5xl font-bold text-gray-900">
                  Welcome back to Mama_MicaGlow
                </h1>
                <p className="mb-8 text-xl leading-relaxed text-gray-600">
                  Sign in to continue your peptide journey with exclusive access to group buys and regional communities.
                </p>

                {/* Benefits Grid */}
                <div className="grid grid-cols-1 gap-6">
                  <div className="flex items-center space-x-4 rounded-2xl border border-white/20 bg-white/60 p-6 shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-purple-200">
                      <Package className="h-7 w-7 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Individual Orders</h3>
                      <p className="text-gray-600">Complete boxes with instant checkout and fast shipping</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 rounded-2xl border border-white/20 bg-white/60 p-6 shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-200">
                      <Users className="h-7 w-7 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Group Buys</h3>
                      <p className="text-gray-600">Save up to 20% with community purchases and bulk orders</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 rounded-2xl border border-white/20 bg-white/60 p-6 shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-purple-200">
                      <Shield className="h-7 w-7 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Secure & Trusted</h3>
                      <p className="text-gray-600">Enterprise-grade security for your data and payments</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="mx-auto w-full max-w-sm sm:max-w-md lg:col-span-3 lg:max-w-lg">
              {/* Mobile Welcome Section */}
              <div className="mb-6 text-center lg:hidden">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg sm:h-16 sm:w-16 sm:rounded-2xl">
                  <Package className="h-6 w-6 text-white sm:h-8 sm:w-8" />
                </div>
                <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                  Welcome back
                </h1>
                <p className="px-2 text-sm leading-relaxed text-gray-600 sm:text-base">
                  Sign in to continue your peptide journey with exclusive access to group buys and regional communities.
                </p>
              </div>

              {/* Sign In Form */}
              <div className="rounded-2xl border border-white/20 bg-white/80 p-4 shadow-2xl backdrop-blur-xl sm:rounded-3xl sm:p-6 lg:p-8">
                <div className="mb-6 text-center sm:mb-8">
                  <h2 className="mb-2 text-xl font-bold text-gray-900 sm:text-2xl">Sign in to your account</h2>
                  <p className="text-sm text-gray-600 sm:text-base">Enter your credentials to access your dashboard</p>
                </div>

                <SignIn
                  path={getI18nPath('/sign-in', locale)}
                  appearance={{
                    elements: {
                      formButtonPrimary: 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-sm w-full sm:py-3.5 sm:px-6 sm:rounded-xl sm:text-base',
                      card: 'shadow-none border-0 bg-transparent max-h-none overflow-visible',
                      headerTitle: 'hidden',
                      headerSubtitle: 'hidden',
                      socialButtonsBlockButton: 'border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 rounded-lg py-2.5 font-medium text-sm sm:rounded-xl sm:py-3.5 sm:text-base',
                      formFieldInput: 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 rounded-lg py-2.5 px-3 transition-all duration-200 text-sm bg-white/50 backdrop-blur-sm sm:rounded-xl sm:py-3.5 sm:px-4 sm:text-base',
                      footerActionLink: 'text-purple-600 hover:text-purple-700 font-semibold transition-colors duration-200 text-sm',
                      formFieldLabel: 'text-gray-700 font-semibold text-xs mb-1 sm:text-sm sm:mb-2',
                      identityPreviewText: 'text-gray-600 text-sm',
                      formFieldSuccessText: 'text-purple-600 text-xs sm:text-sm',
                      formFieldErrorText: 'text-red-600 text-xs sm:text-sm',
                      footerActionText: 'text-gray-600 text-xs sm:text-sm',
                      formResendCodeLink: 'text-purple-600 hover:text-purple-700 font-semibold transition-colors duration-200 text-sm',
                      otpCodeFieldInput: 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 rounded-lg py-2.5 px-3 text-sm bg-white/50 backdrop-blur-sm sm:rounded-xl sm:py-3.5 sm:px-4 sm:text-base',
                      formFieldInputShowPasswordButton: 'text-gray-400 hover:text-gray-600 transition-colors duration-200',
                      formFieldInputShowPasswordIcon: 'text-gray-400',
                      formFieldInputHidePasswordButton: 'text-gray-400 hover:text-gray-600 transition-colors duration-200',
                      formFieldInputHidePasswordIcon: 'text-gray-400',
                      formHeaderTitle: 'text-lg font-bold text-gray-900 sm:text-xl',
                      formHeaderSubtitle: 'text-sm text-gray-600 sm:text-base',
                      formFieldRow: 'mb-4 sm:mb-6',
                      socialButtonsBlockButtonText: 'text-sm sm:text-base',
                      socialButtonsBlockButtonIcon: 'w-4 h-4 sm:w-5 sm:h-5',
                      footer: 'mt-4 sm:mt-6',
                      footerAction: 'text-xs sm:text-sm',
                      dividerLine: 'bg-gray-200',
                      dividerText: 'text-gray-500 text-xs sm:text-sm',
                    },
                  }}
                />
              </div>

              {/* Footer */}
              <div className="mt-6 text-center sm:mt-8">
                <p className="text-sm text-gray-600 sm:text-base">
                  Don't have an account?
                  {' '}
                  <Link href="/sign-up" className="font-semibold text-purple-600 transition-colors duration-200 hover:text-purple-700 hover:underline">
                    Create one here
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
