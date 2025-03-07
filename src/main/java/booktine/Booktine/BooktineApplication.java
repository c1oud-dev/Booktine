package booktine.Booktine;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class BooktineApplication {

	public static void main(String[] args) {
		SpringApplication.run(BooktineApplication.class, args);
	}

}
