package booktine.Booktine.controller;

import booktine.Booktine.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequiredArgsConstructor
public class AuthController {
    private final UserService userService;

    // 메인 페이지 (예: index.html)
    @GetMapping("/")
    public String home() {
        return "index";
    }

    // 회원가입 페이지
    @GetMapping("/signup")
    public String signupForm() {
        return "signup"; // Thymeleaf 템플릿 (signup.html)
    }

    // 회원가입 처리
    @PostMapping("/signup")
    public String signupProcess(@RequestParam String email,
                                @RequestParam String password,
                                @RequestParam String firstName,
                                @RequestParam String lastName,
                                Model model) {
        try {
            userService.registerUser(email, password, firstName, lastName);
            return "redirect:/login";
        } catch (IllegalArgumentException e) {
            model.addAttribute("errorMessage", e.getMessage());
            return "signup";
        }
    }

    // 로그인 페이지
    @GetMapping("/login")
    public String loginPage(@RequestParam(required = false) String error, Model model) {
        if (error != null) {
            model.addAttribute("errorMessage", "로그인 실패");
        }
        return "login"; // Thymeleaf 템플릿 (login.html)
    }
}
