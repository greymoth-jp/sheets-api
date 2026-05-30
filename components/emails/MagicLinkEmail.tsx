import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Tailwind,
} from "@react-email/components";

interface MagicLinkEmailProps {
  url: string;
}

export function MagicLinkEmail({ url }: MagicLinkEmailProps) {
  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="bg-slate-950 font-sans">
          <Container className="mx-auto max-w-md p-8">
            <Section>
              <Text className="text-2xl font-bold text-slate-100 mb-2">
                SheetsAPI
              </Text>
              <Text className="text-slate-400 text-sm mb-6">
                Google Sheets → REST API in 60 seconds
              </Text>
              <Text className="text-slate-200 mb-6">
                Click the button below to sign in. This link expires in 10 minutes.
              </Text>
              <Button
                href={url}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
              >
                Sign in to SheetsAPI
              </Button>
              <Text className="text-slate-500 text-xs mt-6">
                If you did not request this link, you can safely ignore this email.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
