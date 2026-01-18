FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY build.gradle settings.gradle gradlew gradlew.bat ./
COPY gradle/ gradle/

# Fix permissions
RUN chmod +x gradlew

# Copy source
COPY src/ src/

# Build the application
RUN ./gradlew build --no-daemon -x test

# Expose port
EXPOSE 8080

# Run the JAR
CMD ["sh", "-c", "java -jar build/libs/*.jar"]
