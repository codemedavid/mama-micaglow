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
        <div className="container px-6 py-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="group flex items-center space-x-3">
              <div className="gradient-purple flex h-10 w-10 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-105">
                <Package className="h-6 w-6 text-white" />
              </div>
              <span className="gradient-text-purple text-2xl font-bold">
                Mama_MicaGlow
              </span>
            </Link>
            <Button variant="ghost" asChild className="backdrop-blur-sm hover:bg-white/50">
              <Link href="/" className="flex items-center space-x-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-[calc(100vh-120px)] items-center justify-center px-6">
        <div className="w-full">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 lg:grid-cols-5 lg:gap-12">
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
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-green-200">
                      <Shield className="h-7 w-7 text-green-600" />
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
            <div className="mx-auto w-full max-w-md lg:col-span-3 lg:max-w-lg">
              {/* Mobile Welcome Section */}
              <div className="mb-8 text-center lg:hidden">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
                  <Package className="h-8 w-8 text-white" />
                </div>
                <h1 className="mb-3 text-3xl font-bold text-gray-900">
                  Join our community
                </h1>
                <p className="px-4 text-base leading-relaxed text-gray-600">
                  Create your account and start enjoying premium peptides with exclusive group buy discounts and regional community access.
                </p>
              </div>

              {/* Sign Up Form */}
              <div className="rounded-3xl border border-white/20 bg-white/80 p-6 shadow-2xl backdrop-blur-xl lg:p-8">
                <div className="mb-8 text-center">
                  <h2 className="mb-2 text-2xl font-bold text-gray-900">Create your account</h2>
                  <p className="text-gray-600">Join our community and start your peptide journey today</p>
                </div>

                <SignUp
                  path={getI18nPath('/sign-up', locale)}
                  appearance={{
                    elements: {
                      formButtonPrimary: 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl text-base w-full',
                      card: 'shadow-none border-0 bg-transparent',
                      headerTitle: 'hidden',
                      headerSubtitle: 'hidden',
                      socialButtonsBlockButton: 'border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 rounded-xl py-3.5 font-medium',
                      formFieldInput: 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl py-3.5 px-4 transition-all duration-200 text-base bg-white/50 backdrop-blur-sm',
                      footerActionLink: 'text-purple-600 hover:text-purple-700 font-semibold transition-colors duration-200',
                      formFieldLabel: 'text-gray-700 font-semibold text-sm mb-2',
                      identityPreviewText: 'text-gray-600',
                      formFieldSuccessText: 'text-green-600 text-sm',
                      formFieldErrorText: 'text-red-600 text-sm',
                      footerActionText: 'text-gray-600 text-sm',
                      formResendCodeLink: 'text-purple-600 hover:text-purple-700 font-semibold transition-colors duration-200',
                      otpCodeFieldInput: 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 rounded-xl py-3.5 px-4 text-base bg-white/50 backdrop-blur-sm',
                      formFieldInputShowPasswordButton: 'text-gray-400 hover:text-gray-600 transition-colors duration-200',
                      formFieldInputShowPasswordIcon: 'text-gray-400',
                      formFieldInputHidePasswordButton: 'text-gray-400 hover:text-gray-600 transition-colors duration-200',
                      formFieldInputHidePasswordIcon: 'text-gray-400',
                    },
                  }}
                />
              </div>

              {/* Footer */}
              <div className="mt-8 text-center">
                <p className="text-gray-600">
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
