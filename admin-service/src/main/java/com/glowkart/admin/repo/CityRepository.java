package com.glowkart.admin.repo;

import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.glowkart.admin.model.City;

public interface CityRepository extends MongoRepository<City, String> {
    Optional<City> findByNameIgnoreCase(String name);
}
