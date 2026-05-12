package i18n

import "testing"

func TestKoreanLanguageSupport(t *testing.T) {
	if got := ParseAcceptLanguage("ko-KR,ko;q=0.9,en;q=0.8"); got != "ko-KR" {
		t.Fatalf("ParseAcceptLanguage() = %q, want %q", got, "ko-KR")
	}

	if !IsSupported("ko") {
		t.Fatal("expected ko to be supported")
	}

	if err := Init(); err != nil {
		t.Fatalf("Init() error = %v", err)
	}

	if got := Translate("ko-KR", "common.invalid_params"); got != "잘못된 매개변수입니다" {
		t.Fatalf("Translate() = %q, want Korean translation", got)
	}
}
