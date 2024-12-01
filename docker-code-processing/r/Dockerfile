# Use the official R image
FROM r-base:4.3.1

# Set the working directory
WORKDIR /app

# Install additional R packages if needed (uncomment to install)
# RUN R -e "install.packages('ggplot2', repos='http://cran.rstudio.com/')"

# Copy the current directory contents into the container at /app.
COPY . /app

# Define the command to run the R script
ENTRYPOINT ["Rscript", "code.R"]
