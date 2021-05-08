// Initialization Parameters
let star_mass = 100
let planet_mass = 1
let numPlanets = 100
let factor = 1
let G = 1
collision_detection = true
center_star = true

// Function Parameters
let star
let planets = []

function setup() {
  createCanvas(windowWidth,windowHeight)
  
  // Create planets at random positions, with tangential velocity
  for (let i = 0; i < numPlanets; i++) {
    let r = random(star_mass * 1.5, min(windowWidth/2, windowHeight/2))
    let theta = random(0, TWO_PI)
    let planet_pos = createVector(r * cos(theta), r * sin(theta))
  
    let planet_vel = planet_pos.copy()
    // Rotating planet direction vector
    planet_vel.rotate(HALF_PI)
    planet_vel.setMag( sqrt(G * star_mass / planet_pos.mag()))
    planets.push(new Body(planet_mass, planet_pos, planet_vel))
    
  }
  
  // Create star at screen center
  star = new Body(star_mass,createVector(0, 0),createVector(0,0))
}

function draw() {
  background(50)
  translate(width/2, height/2)
  star.show()
  star.update()
  
  // Calculate and simulate gravitational forces between planets and star
  for (let i = 0; i < planets.length; i++) {
    if (center_star == false) {
      planets[i].gravity(star)
    }
    star.gravity(planets[i])
    planets[i].update()
    planets[i].show_planet()
    
    // Calculate and simulate gravitational forces between planets
    for (let j = 0; j < planets.length; j++) {
      if ( i != j) {
        planets[i].gravity(planets[j])

      }
    }
    
    // Collision detection, removes one planet if collision with star
    if(collision_detection) {
      if (star.collision(planets[i])) {
      print(i + " star collision")
        if (center_star == false) {
          star.transfer_momentum(planets[i])
        }
      planets.splice(i,1)
      }
    }
    
  }
  
  // Collision detection, removes one planet if collision with another planet
  if(collision_detection) {
    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        if ( i != j) {
          if (planets[i].collision(planets[j])) {
            print(i, j )
            planets[i].transfer_momentum(planets[j])
            planets.splice(j,1)
          }
        }
      }
    }
  }
}

function Body(_mass, _pos, _vel) {
  this.mass = _mass
  this.pos = _pos
  this.vel = _vel
  this.r = this.mass
  this.path = []

  // Draw star
  this.show = function() {
    noStroke(); fill(235, 142, 56);
    ellipse(this.pos.x, this.pos.y, this.r)
  }
  
  // Draw planets and trajectory
  this.show_planet = function() {
    noStroke(); fill(255);
    ellipse(this.pos.x, this.pos.y, this.r * factor)
    stroke(200);
    for (let i = 0; i < this.path.length - 2; i++) {
      line(this.path[i].x, this.path[i].y, this.path[i+1].x, this.path[i+1].y)
    }
  }
  
  // Update body position and trajectory plot
  this.update = function() {
    this.pos.x += this.vel.x
    this.pos.y += this.vel.y
    
    this.path.push(this.pos.copy())
    if (this.path.length > 100) {
      this.path.splice(0, 1)
    }
  }
  
  // Calculate new body velocity
  this.force = function(f) {
    this.vel.x += f.x / this.mass
    this.vel.y += f.y / this.mass
  }
  
  // Calculate gravitational force vector
  this.gravity = function(body1) {
    let r = this.distance(body1)
    let f = this.pos.copy().sub(body1.pos)
    force = f.setMag((G * this.mass * body1.mass) / (r * r))
    body1.force(force)
  }
  
  // Calculate distance between bodies
  this.distance = function(body1) {
    let r = dist(this.pos.x, this.pos.y, body1.pos.x, body1.pos.y)
    return r
  }
  
  //Determine if collision is true
  this.collision = function(body1) {
    let r = this.distance(body1)
    if (r < (this.r / 2) + (body1.r * factor / 2)) {
      return true
    }
    
  return false
  }
  
  // Transfer of momentum and mass
  this.transfer_momentum = function(body1) {
    this.mass += body1.mass
    this.r += body1.r
    this.vel.x += body1.vel.x * (body1.mass / this.mass)
    this.vel.y += body1.vel.y * (body1.mass / this.mass)  
    print(this.mass)
  }
  
}
