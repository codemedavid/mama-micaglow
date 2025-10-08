import { Facebook, Instagram, Mail, MapPin, Package, Phone, Twitter } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="gradient-purple flex h-8 w-8 items-center justify-center rounded-lg">
                <Package className="h-5 w-5 text-white" />
              </div>
              <span className="gradient-text-purple text-xl font-bold">
                Mama_MicaGlow
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Premium peptide retail platform offering individual purchases,
              group buys, and regional sub-groups for the Philippines.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 cursor-pointer text-muted-foreground hover:text-primary" />
              <Twitter className="h-5 w-5 cursor-pointer text-muted-foreground hover:text-primary" />
              <Instagram className="h-5 w-5 cursor-pointer text-muted-foreground hover:text-primary" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="text-muted-foreground hover:text-primary">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-muted-foreground hover:text-primary">
                  Individual Purchase
                </Link>
              </li>
              <li>
                <Link href="/products/group-buy" className="text-muted-foreground hover:text-primary">
                  Group Buy
                </Link>
              </li>
              <li>
                <Link href="/products/sub-groups" className="text-muted-foreground hover:text-primary">
                  Regional Sub-Groups
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-muted-foreground hover:text-primary">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-muted-foreground hover:text-primary">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-muted-foreground hover:text-primary">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Contact Us</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">support@mamamicalglow.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">+63 915 490 1224</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Manila, Philippines</span>
              </div>
            </div>
            <div className="pt-2">
              <p className="text-xs text-muted-foreground">
                All prices in Philippine Peso (₱)
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between border-t pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © 2024 Mama_MicaGlow. All rights reserved.
          </p>
          <p className="mt-2 text-sm text-muted-foreground md:mt-0">
            Made with ❤️ for the Philippines
          </p>
        </div>
      </div>
    </footer>
  );
}
